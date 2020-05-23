#include "Arduino.h"
#include <SPI.h>
#include <RF24.h>
#include <LiquidCrystal.h>
const int rs = 10, en = 9, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

// Sensor calibration
float Vo1;
float R1 = 10000;
float R2, T1, Tc0, Tc1, Tc2, Tc3, Tc4, Tc5, Tc6, Tc7, Tc8, Tc9, Tc10, Tc11, Tc12, Tc13, Tc14, lg;
float c1 = 1.009249522e-03, c2 = 2.378405444e-04, c3 = 2.019202697e-07;
float ave1, ave2;
int maxTemp, conTemp, pressure, Tx, PWM;
unsigned long Time;

// This is just the way the RF24 library works:
// Hardware configuration: Set up nRF24L01 radio on SPI bus (pins 10, 11, 12, 13) plus pins 7 & 8
RF24 radio(7, 8);

byte addresses[][6] = {"1Node", "2Node"};
int gotArray[16];

// -----------------------------------------------------------------------------
// SETUP   SETUP   SETUP   SETUP   SETUP   SETUP   SETUP   SETUP   SETUP
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  Serial.println("THIS IS THE TRANSMITTER CODE - YOU NEED THE OTHER ARDIUNO TO SEND BACK A RESPONSE");

  // Initiate the radio object
  radio.begin();

  // Set the transmit power 
  radio.setPALevel(RF24_PA_MAX);

  // Set the speed of the transmission to the quickest available
  radio.setDataRate(RF24_2MBPS);

  // Use a channel unlikely to be used by Wifi, Microwave ovens etc
  radio.setChannel(124);

  // Open a writing and reading pipe on each radio, with opposite addresses
  radio.openWritingPipe(addresses[1]);
  radio.openReadingPipe(1, addresses[0]);
//  radio.startListening();
  // LCD
  lcd.begin(16, 2);
//  // Print a message to the LCD.
  lcd.print("   PHP Cubed:   ");
  lcd.setCursor(0, 1);
  lcd.print("POWER CONTROLLER"); 
  maxTemp = 0;
  ave2 = 0;
delay(2000);
}

// -----------------------------------------------------------------------------
// LOOP     LOOP     LOOP     LOOP     LOOP     LOOP     LOOP     LOOP     LOOP
// -----------------------------------------------------------------------------
void loop() {
 // Finding the max temperature value
 maxTemp = 0;

    for (byte i = 3; i < 16; i+=3) {
    Vo1 = gotArray[i];
    R2 = R1 *(1023.0 / (float)Vo1 - 1.0);
    lg = log(R2);
    T1 = 1.0 / (c1 + c2*lg + c3*lg*lg*lg);
    Tc1 = T1 - 273.15;
    Tx  = round(T1 - 273.15);
    if(Tx > maxTemp){
      maxTemp = Tx;
    }
    }
  // LCD control  
  lcd.setCursor(0, 0);
  lcd.print("CON P:");
  lcd.print(pressure);
  lcd.print(" T:");
  lcd.print(conTemp);
  lcd.print("        ");
  lcd.setCursor(0, 1);

  // Saftey software cutoffs and PWM control
  int sensorValue = analogRead(A0);
   // If the temperature is less than 88 then the PWM is set depending on the position of the potentiometer
   if(maxTemp < 88){
    PWM = map(sensorValue, 0, 1023, 0, 50);
    } 
   // If the max temperature is 88 or over then the PWM is set to 0
   if(maxTemp >= 88){
    PWM = 0;
    }
   // If the pressure is over 1350 then the PWM is set to 0
   if(ave2 > 1350){
    PWM = 0;
    }
  lcd.print("EVP PWM:");
  lcd.print(PWM);
  lcd.print(" T:");
  lcd.print(maxTemp);
  lcd.print("        ");

  // Ensure we have stopped listening (even if we're not) or we won't be able to transmit
  radio.stopListening(); 

  // Did we manage to SUCCESSFULLY transmit that (by getting an acknowledgement back from the other Arduino)?
  // Even we didn't we'll continue with the sketch, you never know, the radio fairies may help us
  if (!radio.write( &PWM, sizeof(PWM) )) {
    Serial.println("No transmission - Power-up Test Cell");    
  }
  // Now listen for a response
  radio.startListening();
  
  // But we won't listen for long, 200 milliseconds is enough
  unsigned long started_waiting_at = millis();

  // Loop here until we get indication that some data is ready for us to read (or we time out)
  while ( ! radio.available() ) {

    // Oh dear, no response received within our timescale
    if (millis() - started_waiting_at > 200 ) {
      Serial.println("No response received - timeout!");
      return;
    }
  } 
radio.read( &gotArray, sizeof(gotArray) );
// Now read the data that is waiting for us in the nRF24L01's buffer

    //  Pressure:
    ave1 = 0;
    ave2 = 0;  
    for (int i = 1; i <= 10; i++) {    
    int sensorVal=gotArray[0];
// Convert pressure using calibration values
    float voltage = (sensorVal*5.0)/1023.0; 
    float pressure_bar = ((((float)voltage)*500)+(-25.6));
// Smooth the pressure values by averaging
    ave1 = ave2+ pressure_bar;
    ave2 = ave1;    
    }
    ave2 = ave1/10;
    pressure = round(ave2);
    Serial.print(ave2);
    Serial.print(",");
    
//  Temperature
    for (byte i = 1; i < 16; i++) {
    Vo1 = gotArray[i];
// Convert temperature based on calibration values
    R2 = R1 *(1023.0 / (float)Vo1 - 1.0);
    lg = log(R2);
    T1 = 1.0 / (c1 + c2*lg + c3*lg*lg*lg);
    Tc1 = T1 - 273.15;
    Serial.print(Tc1);  
    Serial.print(",");   
    }
  
//  Timestamp
    Time = millis();
    Serial.println(Time);

// Find the max temp at the condenser (our experiment only)
conTemp = 0;
    for (byte i = 1; i < 16; i+=3) {
    Vo1 = gotArray[i];
    R2 = R1 *(1023.0 / (float)Vo1 - 1.0);
    lg = log(R2);
    T1 = 1.0 / (c1 + c2*lg + c3*lg*lg*lg);
    Tc1 = T1 - 273.15;
    Tx  = round(T1 - 273.15);
    if(Tx > conTemp){
      conTemp = Tx;
    }
    }
   delay(0);
}
