import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Check, ArrowLeft } from 'lucide-react';

// Mock QR Code component
const QRCode = ({ value }) => (
  <div className="p-4 bg-white border rounded-lg">
    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`} alt="QR Code" />
  </div>
);

export default function DevicePairingHandler({ onPair, onCancel }) {
  const [pairingToken, setPairingToken] = useState('');
  const [isPaired, setIsPaired] = useState(false);

  useEffect(() => {
    // In a real app, you would generate a secure, unique token from the backend
    const token = `pair_${Math.random().toString(36).substr(2, 9)}`;
    setPairingToken(token);
    
    // In a real app, you'd listen for a pairing confirmation via WebSocket or polling
  }, []);

  const handleSimulatePairing = () => {
    // This is a simulation. In a real app, the backend would confirm pairing.
    setIsPaired(true);
    setTimeout(() => {
      onPair({ name: 'Paired Mobile Camera' });
    }, 1500);
  };

  const pairingUrl = `${window.location.origin}/pair?token=${pairingToken}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Pair a Mobile Device
        </CardTitle>
        <CardDescription>
          Scan the QR code with your mobile device to connect it as a camera source.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {isPaired ? (
          <div className="text-center text-green-600 flex flex-col items-center">
            <Check className="w-16 h-16 mb-4" />
            <p className="text-lg font-semibold">Device Paired Successfully!</p>
            <p>You can now close this window on your mobile device.</p>
          </div>
        ) : (
          <>
            <QRCode value={pairingUrl} />
            <p className="text-sm text-center text-slate-500">
              Waiting for device to connect...
            </p>
            {/* This button is for demonstration purposes */}
            <Button variant="outline" size="sm" onClick={handleSimulatePairing}>
              (Simulate Pairing)
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button disabled={!isPaired} onClick={() => onPair({ name: 'Paired Mobile Camera' })}>
          Finish Setup
        </Button>
      </CardFooter>
    </Card>
  );
}