FABRIC_BASE=/home/hossein/workspace/hyperledger/fabric-samples
export PATH=${FABRIC_BASE}/bin:$PATH
export FABRIC_CFG_PATH=${FABRIC_BASE}/config

# export CORE_PEER_MSPCONFIGPATH=/home/hossein/workspace/greentech/InterAirlining/msp

# export CORE_PEER0_ORG1_ADDRESS=peer0-org1-greendemo-inter-airlining-baas.greenrnd.com:443
# export CORE_PEER_ORG1_TLS_ROOTCERT_FILE=/home/hossein/workspace/greentech/InterAirlining/msp/tlscacerts/org1/tls.pem

# export CORE_PEER0_ORG2_ADDRESS=peer0-org2-greendemo-inter-airlining-baas.greenrnd.com:443
# export CORE_PEER_ORG2_TLS_ROOTCERT_FILE=/home/hossein/workspace/greentech/InterAirlining/msp/tlscacerts/org2/tls.pem

# export CORE_ORDERER_ADDRESS=orderer0-orderer-org1-greendemo-inter-airlining-baas.greenrnd.com:443
# export CORE_PEER_LOCALMSPID=Orgorg1MSP
# export CORE_PEER_TLS_ENABLED=true


# peer chaincode invoke \
#     -C inter-airlining \
#     -n inter-airlining \
#     -o $CORE_ORDERER_ADDRESS \
#     --tls true --cafile $CORE_PEER_ORG1_TLS_ROOTCERT_FILE \
#     --peerAddresses $CORE_PEER0_ORG1_ADDRESS $CORE_PEER0_ORG2_ADDRESS \
#     --tlsRootCertFiles $CORE_PEER_ORG1_TLS_ROOTCERT_FILE $CORE_PEER_ORG2_TLS_ROOTCERT_FILE \
#     -c '{"function":"createBaggage","Args":["bag_002", "user_0001", "25", "100"]}'


export CORE_PEER_MSPCONFIGPATH=/home/hossein/workspace/greentech/InterAirlining/msp-old

export CORE_PEER0_ORG1_ADDRESS=peer0-org1-greendemo-inerairlining-baas.greenrnd.com:443
export CORE_PEER_ORG1_TLS_ROOTCERT_FILE=$CORE_PEER_MSPCONFIGPATH/tlscacerts/org1/tls.pem

export CORE_PEER0_ORG2_ADDRESS=peer0-org2-greendemo-inerairlining-baas.greenrnd.com:443
export CORE_PEER_ORG2_TLS_ROOTCERT_FILE=$CORE_PEER_MSPCONFIGPATH/tlscacerts/org2/tls.pem

export CORE_ORDERER_ADDRESS=orderer0-orderer-org1-greendemo-inerairlining-baas.greenrnd.com:443
export CORE_PEER_LOCALMSPID=Orgorg1MSP
export CORE_PEER_TLS_ENABLED=true


peer chaincode invoke \
    -C interairlining \
    -n interairlining \
    -o $CORE_ORDERER_ADDRESS \
    --tls true --cafile $CORE_PEER_ORG1_TLS_ROOTCERT_FILE \
    --peerAddresses $CORE_PEER0_ORG1_ADDRESS \
    --tlsRootCertFiles $CORE_PEER_ORG1_TLS_ROOTCERT_FILE \
    -c '{"function":"createBaggage","Args":["bag_010", "user_0012", "25", "100"]}'