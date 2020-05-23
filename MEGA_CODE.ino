#include "Arduino.h"
#include <SPI.h>
#include <RF24.h>

// This is just the way the RF24 library works:
// Hardware configuration: Set up nRF24L01 radio on SPI bus (pins 10, 11, 12, 13) plus pins 6 & 7
RF24 radio(6, 7);

byte addresses[][6] = {"1Node","2Node"};
int Array[16];

// -----------------------------------------------------------------------------
// SETUP   SETUP   SETUP   SETUP   SETUP   SETUP   SETUP   SETUP   SETUP
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  Serial.println("THIS IS THE RECEIVER CODE - YOU NEED THE OTHER ARDUINO TO TRANSMIT");

  // Initiate the radio object
  radio.begin();

  // Set the transmit power to lowest available to prevent power supply related issues
  radio.setPALevel(RF24_PA_MAX);

  // Set the speed of the transmission to the quickest available
  radio.setDataRate(RF24_2MBPS);

  // Use a channel unlikely to be used by Wifi, Microwave ovens etc
  radio.setChannel(124);

  // Open a writing and reading pipe on each radio, with opposite addresses
  radio.openWritingPipe(addresses[0]);
  radio.openReadingPipe(1, addresses[1]);

  // Start the radio listening for data
  radio.startListening();

  pinMode( 7, OUTPUT );
  // Set the digital pin 5 to output for PWM
  pinMode( 5, OUTPUT );
}

// -----------------------------------------------------------------------------
// We are LISTENING on this device only (although we do transmit a response)
// -----------------------------------------------------------------------------
void loop() {

  // This is what we receive from the other device (the transmitter)
  unsigned char power;
  unsigned long started_waiting_at = millis();
  // Is there any data for us to get?
  while ( ! radio.available() ) {

    // Oh dear, no response received within our timescale
    if (millis() - started_waiting_at > 200 ) {
    // Ensures the power is set to 0 if signal is lost
      analogWrite(5,0);
      Serial.println("No response received - PWM set to 0");
      return;
    }
  }
  if ( radio.available()) {
    // Go and read the data and put it into that variable
    while (radio.available()) {
    // Read PWM value
      radio.read( &power, sizeof(char));
    }

    // First, stop listening so we can talk
    radio.stopListening();
    // Set PWM value and create an array from the sensor values
    analogWrite(5,power);
   Array[0] = analogRead(A15);
   Array[1] = analogRead(A0); 
   Array[2] = analogRead(A1);
   Array[3] = analogRead(A2); 
   Array[4] = analogRead(A3);
   Array[5] = analogRead(A4); 
   Array[6] = analogRead(A5);
   Array[7] = analogRead(A6); 
   Array[8] = analogRead(A7);
   Array[9] = analogRead(A8); 
   Array[10] = analogRead(A9);
   Array[11] = analogRead(A10); 
   Array[12] = analogRead(A11);
   Array[13] = analogRead(A12); 
   Array[14] = analogRead(A13);
   Array[15] = analogRead(A14);

    // Send the array of sensor values to the UNO
    radio.write( &Array, sizeof(Array));

    // Now, resume listening so we catch the next packets.
    radio.startListening();

    // Tell the user what we sent back
    Serial.println("Array sent");
    Serial.print("PWM value = "); 
    Serial.println(power);
  

  }
}
