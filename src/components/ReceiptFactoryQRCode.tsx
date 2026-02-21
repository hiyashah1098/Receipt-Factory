import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-qr-code';

interface ReceiptFactoryQRCodeProps {
  value?: string;
}

const ReceiptFactoryQRCode: React.FC<ReceiptFactoryQRCodeProps> = ({ value = 'https://receiptfactory.com' }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <QRCode value={value} size={180} />
    </View>
  );
};

export default ReceiptFactoryQRCode;
