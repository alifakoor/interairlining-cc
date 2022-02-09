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

FABRIC_BASE=/home/hossein/workspace/hyperledger/fabric-samples
CRYPTO_BASE=${FABRIC_BASE}/test-network
ORDERER_TLS_CA_FILE_ADDRESS=${CRYPTO_BASE}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
PEER0_ORG1_TLS_CA_FILE_ADDRESS=${CRYPTO_BASE}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
PEER0_ORG2_TLS_CA_FILE_ADDRESS=${CRYPTO_BASE}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
ORG1_ADMIN_MSP_PATH=${CRYPTO_BASE}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
ORG2_ADMIN_MSP_PATH=${CRYPTO_BASE}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp


export PATH=${FABRIC_BASE}/bin:$PATH
export FABRIC_CFG_PATH=${FABRIC_BASE}/config

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

switchOrg1

# peer chaincode invoke \
#     -o ${ORDERER_URL} \
#     --ordererTLSHostnameOverride ${ORDERER_HOST} \
#     --tls \
#     --cafile ${ORDERER_TLS_CA_FILE_ADDRESS} \
#     -C ${CHANNEL_NAME} \
#     -n ${CC_NAME} \
#     --peerAddresses ${PEER0_ORG1_URL} \
#     --tlsRootCertFiles ${PEER0_ORG1_TLS_CA_FILE_ADDRESS} \
#     --peerAddresses ${PEER0_ORG2_URL} \
#     --tlsRootCertFiles ${PEER0_ORG2_TLS_CA_FILE_ADDRESS} \
#     -c '{"function":"createBaggage","Args":["bag_001", "user_0001", "25", "100"]}'

peer chaincode invoke \
    --tls \
    -o ${ORDERER_URL} \
    --ordererTLSHostnameOverride ${ORDERER_HOST} \
    --cafile ${ORDERER_TLS_CA_FILE_ADDRESS} \
    --peerAddresses ${PEER0_ORG1_URL} \
    --tlsRootCertFiles ${PEER0_ORG1_TLS_CA_FILE_ADDRESS} \
    --peerAddresses ${PEER0_ORG2_URL} \
    --tlsRootCertFiles ${PEER0_ORG2_TLS_CA_FILE_ADDRESS} \
    -C ${CHANNEL_NAME} \
    -n ${CC_NAME} \
    -c '{"function":"getBaggage","Args":["bag_001"]}'

# peer chaincode invoke \
#     -o ${ORDERER_URL} \
#     --ordererTLSHostnameOverride ${ORDERER_HOST} \
#     --tls \
#     --cafile ${ORDERER_TLS_CA_FILE_ADDRESS} \
#     -C ${CHANNEL_NAME} \
#     -n ${CC_NAME} \
#     --peerAddresses ${PEER0_ORG1_URL} \
#     --tlsRootCertFiles ${PEER0_ORG1_TLS_CA_FILE_ADDRESS} \
#     --peerAddresses ${PEER0_ORG2_URL} \
#     --tlsRootCertFiles ${PEER0_ORG2_TLS_CA_FILE_ADDRESS} \
#     -c '{"function":"updateBaggageOwner","Args":["bag_001", "user_0002"]}'

# peer chaincode invoke \
#     -o ${ORDERER_URL} \
#     --ordererTLSHostnameOverride ${ORDERER_HOST} \
#     --tls \
#     --cafile ${ORDERER_TLS_CA_FILE_ADDRESS} \
#     -C ${CHANNEL_NAME} \
#     -n ${CC_NAME} \
#     --peerAddresses ${PEER0_ORG1_URL} \
#     --tlsRootCertFiles ${PEER0_ORG1_TLS_CA_FILE_ADDRESS} \
#     --peerAddresses ${PEER0_ORG2_URL} \
#     --tlsRootCertFiles ${PEER0_ORG2_TLS_CA_FILE_ADDRESS} \
#     -c '{"function":"getBaggage","Args":["bag_001"]}'