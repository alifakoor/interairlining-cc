while getopts "v:s:" opt
do
   case "$opt" in
      v ) CC_VERSION="$OPTARG" ;;
   esac
done

CHANNEL_NAME="demo" 
CC_NAME="interairlining"
CC_PACKAGE_NAME="${CC_NAME}_v${CC_VERSION}.tar.gz"
CC_SRC_PATH="./"
CC_SRC_LANGUAGE="node"

ORDERER_HOST="orderer.example.com"
ORDERER_URL="localhost:7050"
PEER0_ORG1_URL="localhost:7051"
PEER0_ORG2_URL="localhost:9051"

CRYPTO_BASE="/home/hossein/workspace/hyperledger/fabric-samples/test-network"
ORDERER_TLS_CA_FILE_ADDRESS=${CRYPTO_BASE}"/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
PEER0_ORG1_TLS_CA_FILE_ADDRESS=${CRYPTO_BASE}"/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
PEER0_ORG2_TLS_CA_FILE_ADDRESS=${CRYPTO_BASE}"/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
ORG1_ADMIN_MSP_PATH=${CRYPTO_BASE}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
ORG2_ADMIN_MSP_PATH=${CRYPTO_BASE}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp


export PATH=/home/hossein/workspace/hyperledger/fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=/home/hossein/workspace/hyperledger/fabric-samples/config

switchOrg1() {
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PEER0_ORG1_TLS_CA_FILE_ADDRESS}
    export CORE_PEER_MSPCONFIGPATH=${ORG1_ADMIN_MSP_PATH}
    export CORE_PEER_ADDRESS=localhost:7051
}

switchOrg2() {
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PEER0_ORG2_TLS_CA_FILE_ADDRESS}
    export CORE_PEER_MSPCONFIGPATH=${ORG2_ADMIN_MSP_PATH}
    export CORE_PEER_ADDRESS=localhost:9051
}

packageCC() {
    peer lifecycle chaincode package ${CC_PACKAGE_NAME} --path ${PWD} --lang node --label ${CC_NAME}_${CC_VERSION}
}

installCC() {
    peer lifecycle chaincode install ${CC_PACKAGE_NAME}
}

queryInstalled() {
  set -x
  peer lifecycle chaincode queryinstalled > log.txt
  { set +x; } 2>/dev/null
  PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
  echo $PACKAGE_ID
}

queryApproved() {
    set -x
    peer lifecycle chaincode queryapproved -C ${CHANNEL_NAME} -n ${CC_NAME} > dummy.txt
    { set +x; } 2>/dev/null
    CC_SEQUENCE=$(sed -n "{s/Approved.*//; s/sequence: //; s/, version:.*$//; p}" dummy.txt)
    if [ -z $CC_SEQUENCE ]; then CC_SEQUENCE="1"; else CC_SEQUENCE="$(($CC_SEQUENCE + 1))"; fi
}

approveForMyOrg() {
    peer lifecycle chaincode approveformyorg -o ${ORDERER_URL} \
        --ordererTLSHostnameOverride ${ORDERER_HOST} \
        --channelID ${CHANNEL_NAME} \
        --name ${CC_NAME} \
        --version ${CC_VERSION} \
        --package-id $PACKAGE_ID \
        --sequence ${CC_SEQUENCE} \
        --tls \
        --cafile ${ORDERER_TLS_CA_FILE_ADDRESS}
}


checkCommitReadiness() {
    peer lifecycle chaincode checkcommitreadiness \
        --channelID ${CHANNEL_NAME} \
        --name ${CC_NAME} \
        --version ${CC_VERSION} \
        --sequence ${CC_SEQUENCE} \
        --tls \
        --cafile ${ORDERER_TLS_CA_FILE_ADDRESS} \
        --output json
}

commitChaincodeDefinition() {
    peer lifecycle chaincode commit \
        -o ${ORDERER_URL} \
        --ordererTLSHostnameOverride ${ORDERER_HOST} \
        --channelID ${CHANNEL_NAME} \
        --name ${CC_NAME} \
        --version ${CC_VERSION} \
        --sequence ${CC_SEQUENCE} \
        --tls \
        --cafile ${ORDERER_TLS_CA_FILE_ADDRESS} \
        --peerAddresses ${PEER0_ORG1_URL} \
        --tlsRootCertFiles ${PEER0_ORG1_TLS_CA_FILE_ADDRESS} \
        --peerAddresses ${PEER0_ORG2_URL} \
        --tlsRootCertFiles ${PEER0_ORG2_TLS_CA_FILE_ADDRESS}
}

queryCommited() {
    peer lifecycle chaincode querycommitted \
        --channelID ${CHANNEL_NAME} \
        --name ${CC_NAME} \
        --cafile ${ORDERER_TLS_CA_FILE_ADDRESS}
}



npm i
npm run build

packageCC

echo Install 1

switchOrg1
queryApproved
installCC

echo Install 2

switchOrg2
queryApproved
installCC

echo ${CC_SEQUENCE}
queryInstalled 1

echo "approve 1"
switchOrg1
approveForMyOrg

echo "approve 2"
switchOrg2
approveForMyOrg

echo "check commits"
checkCommitReadiness

echo "commit"
commitChaincodeDefinition

echo "query commit"
queryCommited