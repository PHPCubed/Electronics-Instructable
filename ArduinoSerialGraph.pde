import processing.serial.*;
import controlP5.*;
  
ControlP5 cp5;
Range range;

Serial myPort; // The serial port
int tempValuesNum = 16; //define the number of sensors being read

//Variables to draw a continuous line.
float[] currentxPos = new float[tempValuesNum]; // x position of the graph
float[] currentyPos = new float[tempValuesNum]; // y position of the graph
float[] lastxPos = new float[tempValuesNum];
float[] lastyPos = new float[tempValuesNum];
float[] zeroyPos = new float[tempValuesNum];
float shr = 0; //hours
float smn = 0; //mins
float ssc = 0; //sec
float shr1 = 0; //hours
float smn1 = 0; //mins
float ssc1 = 0; //sec
float zeroY = 0;

//variables to store temperatures and colours
float[] tempValues = new float[tempValuesNum];
float[][] tempColors = new float[tempValuesNum][3];

// setting the boundaries of the graph
float maxTemp = 120;
float maxPressure = 1300;
float minPressure = 200;
float minTemp = 18;
float gapBetweenX = 1;
int globalX = 0;
int drawingX = 0;
int screenproportion = 0;
int sliderMin, sliderMax;
PrintWriter output;
boolean pressed =false;
boolean enoughbuffer =false;

Boolean firstValue[] = new Boolean[tempValuesNum];
Boolean blockSlider = false;

enum State {
  RUN,
  PAUSE,
}

State mystate = State.RUN;

// defining 3D array for the sensor data; sensor number, xy value, value
float[][][] bufferTemp = new float[tempValuesNum][2][1];

//float[][] bufferValues = new float[tempValuesNum][0];

// set the colour for each sensor
float[][] allColors = {  {45, 45, 45}, //0 - pressure
                         {30, 20, 100}, // 1
                         {200, 200, 200}, // 2
                         {200, 20, 50}, //3
                         {30,20, 140}, // 4
                         {190, 190, 190}, // 5
                         {210, 20, 50}, //6
                         {30,20, 180}, // 7
                         {180, 180, 180}, // 8
                         {220, 20, 50}, //9
                         {30,20, 210}, // 10
                         {170,170, 170}, // 11
                         {230, 20, 50}, //12
                         {30,20, 240}, // 13
                         {160,160, 160}, // 14
                         {240, 20, 50} //15
                   
                 };

float[] blackC ={0,0,0};
float[] greyC ={90,90,90};
float[] lightGreyC ={240,240,240};




  
int getNewSliderRange(){
  float percscreen = (float) width/globalX;
   //System.out.println(percscreen);
  
  int newr = (int)map(percscreen,0,1,0,width);
 
 return newr;
}
//generate a timestamp
String getTimestamp(){
  return hour()+":"+minute()+":"+second()+":"+millis();
}

  //void settings() {
  //  size(1040, 900);
  //}
void setup () {
   //generating a csv file for the data
    shr = hour();
    smn = minute();
    ssc = second();
    //the time and date is the name of the file
    output = createWriter("log"+year()+"."+month()+"."+day()+"."+hour()+"."+minute()+"."+second()+".csv"); 
    //list of headings within the document
    output.println("id,timestamp,Pressure (mBar),T: 1C,T: 1A,T: 1E,T: 2C,T: 2A,T: 2E,T: 3C,T: 3A,T: 3E,T: 4C,T: 4A,T: 4E,T: 5C,T: 5A,T: 5E,Arduino Count (ms)"); 

    // set the window size:

    size(900, 700);
    background(255); // set inital background:
    
    textSize(16);
    textAlign(LEFT,TOP);
    smooth();                                                        
    
    //initialise port that the UNO is connected to
    myPort = new Serial(this, Serial.list()[0], 115200); //Left-USB: Windows PC 1
      //myPort = new Serial(this, "/dev/cu.usbmodem621", 115200); // Macbook Pro 1
       //myPort = new Serial(this, "/dev/cu.usbmodem14301", 115200); //Macbook Pro 2

    // A serialEvent() is generated when a newline character is received :
    myPort.bufferUntil('\r');

    //initialise all Values
    for (int i = 0; i < tempValuesNum; i++) {
      tempValues[i] = 0;
      
      // assign the sensors the colours previously set
      zeroyPos[i] = height;
      zeroY = height;     
      tempColors[i][0] = allColors[i][0];
      tempColors[i][1] = allColors[i][1];
      tempColors[i][2] = allColors[i][2];
 

      firstValue[i] = true;

       //initialise the buffer which will hold the information
      bufferTemp[i][0][0] = 0;
      bufferTemp[i][1][0] = 0;
      

   // define the slider dimensions
    }    
  sliderMin = 0;
  sliderMax = width;
  screenproportion = width*9/10;
  cp5 = new ControlP5(this);
  range = new Range(cp5, "range");
  range.setSize(width,20);
  range.setPosition(0,height-20);



  range.setMin(0);
  range.setMax(width);  
  range.setHandleSize(0);
  //range.setColorForeground(color(40,40,40));
  range.setColorBackground(color(210,210,210));  
  //range.setSliderMode(Slider.FIX);
  range.setRangeValues(0,width);
  range.setBroadcast(true);



// call back the data in cache for use with the slider
  cp5.addCallback(
  new CallbackListener() {
    public void controlEvent(CallbackEvent theEvent) {
        
// slider control
       switch(theEvent.getAction()) {
        case(ControlP5.ACTION_ENTER):
        //println("Action:ENTER");
        cursor(HAND);
        break;
        case(ControlP5.ACTION_LEAVE):
        cursor(ARROW);
        break;
        case(ControlP5.ACTION_PRESSED): 
        //println("Action:PRESSED");
        //only allow to stop moving the slider once the globalX has become bigger than the window
        if(globalX>width){
          blockSlider = true;
        }
        pressed = true;
        range.setLowValueLabel("");
        range.setHighValueLabel("");
        break;
        case(ControlP5.ACTION_RELEASED): 
        //println("Action:RELEASED");
        pressed = false;
        sliderMin = int(theEvent.getController().getArrayValue(0));
        sliderMax = int(theEvent.getController().getArrayValue(1));
        blockSlider = false;
        break;
        //this action is used to detect when the scrollbar is at the borders of 0 or width
        case(ControlP5.ACTION_RELEASEDOUTSIDE): 
        //println("Action:RELEASEDOUT");
        pressed = false;
        sliderMin = int(theEvent.getController().getArrayValue(0));
        sliderMax = int(theEvent.getController().getArrayValue(1));
        blockSlider = false;
        break;
        case(ControlP5.ACTION_BROADCAST): 
        range.setLowValueLabel("");
        range.setHighValueLabel("");
        //println("Action:BROADCAST");
        if (pressed&&enoughbuffer) {
          
          
            sliderMin = int(theEvent.getController().getArrayValue(0));
                        sliderMin = int(theEvent.getController().getArrayValue(1));

            for (int i=0; i<tempValuesNum; i++){

              //drawValuesinScreen(i,screenproportion);
             
            }  
        }
        break;
 

        }
    }
  }
  );

}
//draw Text in the screen clearing the background before writing
void drawText(String text, int x, int y, int widthspace, float[] colorc){
  noStroke();
  fill(255);
  rect(x,y,widthspace,20);
  fill(colorc[0], colorc[1], colorc[2]);
  text(text,x,y);

}
//draws the temperature axis and the time axis
void drawAxis(){

  //line X
    stroke(blackC[0],blackC[1],blackC[2]);
  strokeWeight(3); //stroke wider
  //line(0,height,width,height);  //draw the x-axis line   

  //line Y - temperature
  line(0,0,0,height);  //draw the y-axis line
  
  

  // draws and labels temp axis
  for (int i=0;i<maxTemp;i=i+10){
    int p = (int) map(i,0,maxTemp,0,height);
    //println(p);
    drawText(str(i),0,(height-p), 20, blackC);

    stroke(lightGreyC[0],lightGreyC[1],lightGreyC[2]);
    strokeWeight(0.7); //stroke wider
    line(0,p,width,p);  //draw the x-axis line   

  }
// finds the current code run time
   shr1 = hour()-shr;
  
  if (minute()-smn >= 0) {//get reltive hour, min, second (probably not the neatest method)
    smn1 = minute()-smn; 
  }
  else {
    smn1 = 60 + (minute()-smn);
    shr1 = shr1-1;
  }
  if (second()-ssc >= 0) {
    ssc1 = second()-ssc; 
  }
  else {
    ssc1 = 60 +(second()-ssc);
    smn1 = smn1-1;
  }
  
  //print the run time
  drawText("Time: "+Math.round(shr1)+":"+Math.round(smn1)+":"+Math.round(ssc1), width/2-25, 0, 50, blackC); 
  
  drawText("Temperature (°C)", 0, 0, 100, blackC);
  
  //draw the pressure axis
  stroke(greyC[0],greyC[1],greyC[2]);
  strokeWeight(3); //stroke wider
  //line Y - pressure
  line(width-2,0,width-2,height);  //draw the y-axis line

  //draws and labels the pressure axis
  for (int i=0;i<maxPressure;i=i+50){
    int p = (int) map(i,minPressure,maxPressure,0,height);
    //println(p);
    drawText(str(i),width-30,(height-p), 20, greyC);

  }
  
  drawText("Pressure (mBar)", width-120, 0, 150, greyC);


}
//this method draws as much data as we tell it to draw. 
//Screen proportion = the percentage of the screen the method should write
void drawValuesinScreen(int i,float screenprortionvalue){
    //int lasty=0;
    stroke(tempColors[i][0],tempColors[i][1],tempColors[i][2]); //stroke color
    strokeWeight(2); //stroke wider
    //println(sliderMax);
    
    //we use the endvalue for the loop, this wants to change if we are looking
    //at the end of the buffer or before (were the data should ocuppy 
    //all the screen's width)
    float endvalue = screenprortionvalue;

    //first case: we want the data which is at the end of the buffer
    if ((sliderMax==width)&&(!pressed)) {
        drawingX = globalX - screenproportion;
        endvalue = screenproportion;
    }
    else{
      //second case: we want the data which is at the begining of the buffer
      if(sliderMin==0){
        //println("globalX:"+ globalX+" and width: "+width);
        if (globalX>width){
          endvalue = width;
        }else{
          endvalue = globalX;
        }
        drawingX = 1;

      }
      //any other case: the data is determined by the min slider value
      else{
        //println("globalX:"+ globalX+" and width: "+width+" and sliderMin: "+sliderMin);
        //only go back when we have enough data to see on the left
       

        if (globalX>screenproportion){
            //println("Ahere");
            endvalue = width;
            drawingX = sliderMin;

         }else{

            endvalue = globalX;
        }

     
      }
    
    }
                //println(endvalue);

    for(int v=1;v<endvalue;v=v+1){
 


         line(v, bufferTemp[i][1][drawingX-1], v+gapBetweenX,bufferTemp[i][1][drawingX]);
          drawingX++;

     }
          
    
}
void draw () {
  
  switch (mystate){
     case RUN:
  
      //output.println("refreshdraw: "+hour()+":"+minute()+":"+second()+":"+millis()); // Write the timestamp to the file
      background(255);
      try {
  
         //do this only after there is enough in the buffer
        if (globalX>screenproportion){
          enoughbuffer = true;
          for (int i=0; i<tempValuesNum; i++){
            
            drawValuesinScreen(i,screenproportion);
           
          }
          // delay(60);
      
         }else{
         //before, simply use whatever is in the buffer
      
          for (int j=0; j<tempValuesNum; j++){
            
      
              stroke(tempColors[j][0],tempColors[j][1],tempColors[j][2]); //stroke color
              strokeWeight(2); //stroke wider
      
      
              for (int val=1; val<bufferTemp[j][0].length; val++){
      
                 //println("values: "+bufferTemp[j][1][val-1],"  ",bufferTemp[j][1][val]);
      
                  line(bufferTemp[j][0][val-1], bufferTemp[j][1][val-1], bufferTemp[j][0][val],bufferTemp[j][1][val]);
               
               }
               
          }
             
         }
        
        range.setLowValueLabel("");
        range.setHighValueLabel("");
        drawAxis();
                
    }catch (Exception e) {
      e.printStackTrace();
    }
    break;
    case PAUSE:
    background(255);
    for (int j=0; j<tempValuesNum; j++){

              stroke(tempColors[j][0],tempColors[j][1],tempColors[j][2]); //stroke color
              strokeWeight(2); //stroke wider
      
              for (int val=10; val < globalX; val++){
      
                 //println("values: "+bufferTemp[j][1][val-1],"  ",bufferTemp[j][1][val]);
                  
                  float newx1 = map(bufferTemp[j][0][val-1],0,globalX,0,width);
                  float newx2 = map(bufferTemp[j][0][val-1],0,globalX,0,width);
                  
                  line(newx1, bufferTemp[j][1][val-1], newx2,bufferTemp[j][1][val]);
                  
                  //line(bufferTemp[j][0][val-1], bufferTemp[j][1][val-1], bufferTemp[j][0][val],bufferTemp[j][1][val]);
               
               }
               
          }
    
    break;
    
  }
  range.setLowValueLabel("");
  range.setHighValueLabel("");
  drawAxis();
}
void exit(){
  output.flush(); // Writes the remaining data to the file
  output.close(); // Finishes the file
  super.exit();//let processing carry with it's regular exit routine
}

void serialEvent (Serial myPort) {

  //// get the ASCII string:
  String inLineRead = myPort.readStringUntil('\r').trim();

  String[] listTemperatures = split(inLineRead, ',');


  //check this list is longer than tempValuesNum, otherwise the line is broken.
  if (listTemperatures.length>tempValuesNum){
   output.println(globalX+","+getTimestamp()+","+inLineRead); // Write the timestamp to the file

      for (int i=0; i<tempValuesNum; i++){
        //System.out.println("^^^^^^^^^^ : " + i  + "  "+ globalX);
    
        String inString = listTemperatures[i];
        if (inString != null)  
        {
          inString = trim(inString); // trim off whitespaces.
          tempValues[i] = float(inString); // convert to a number.
        }
      
      //NOW store the values both for temperature and pressure in the buffer
      
      if (!Float.isNaN(tempValues[i])&&((tempValues[i]>=0)&&(tempValues[i]<=1500))) { 

    
            float val = 0;
            if (i==0) val  = (float)map(tempValues[i], minPressure, maxPressure, 0, height);
            else val = (float)map(tempValues[i], 0, maxTemp, 0, height);
            ////int val = (int)map(tempValues[i], minTemp, maxTemp,  -height/2, height/2);
        
            float currenty = zeroY - val;
            
           
            //store the values
            if (!firstValue[i]) {
                ////instead of drawing the line, we will add to the buffer so that this is drawn
                ////add one more element to the buffer
                //add element: X = the previous plus the gap we wish to use and Y = current Y

                bufferTemp[i][0] = append(bufferTemp[i][0], bufferTemp[i][0][globalX-1]+gapBetweenX); 
                bufferTemp[i][1] = append(bufferTemp[i][1], currenty);


            }
            //On the first pass we want to assign a value to our first element of the buffer
            else{ 
                firstValue[i]=false;
                //first element to the buffer: X = 0 and Y = current Y
                bufferTemp[i][0][0] = 0;
                bufferTemp[i][1][0] = currenty;
            }
            
            //println("values: "+bufferTemp[i][1],"  ");

              //println("values: "+globalX+" values: ("+bufferTemp[i][0][globalX]+"," +bufferTemp[i][1][globalX]+")");
    
       } else{ 
          //if this value is NOT actually a number, then just increase in X without drawing

              if (!firstValue[i]) {
                                                          //System.out.println(bufferTemp[i-1][0][i-1]);
                //add element: X = the previous plus the gap we wish to use and Y = 0

                bufferTemp[i][0] = append(bufferTemp[i][0], bufferTemp[i][0][globalX-1]+gapBetweenX); 
                bufferTemp[i][1] = append(bufferTemp[i][1], 0);

                //println(bufferTemp[i-1][0][i-1]);
               
              }else{ 
                firstValue[i]=false;
      
                bufferTemp[i][0][0] = 1;
                bufferTemp[i][1][0] = 0;
                
      
              }
       }

 
      
      }//end of for loop
     globalX++;

      //*************SLIDER IS DEALT WITH HERE*********8
      if ((globalX>width)){ 
            
            if (!blockSlider){
               int p = getNewSliderRange();
               range.setRangeValues(sliderMin,sliderMin+p);
                
              if (sliderMax==width) {
                  range.setRangeValues(width-p,width);
                
               }
            }
            
            
            }

    
   }//end of if statement 

}
// additional utility buttons to zoom in on the data
void keyPressed() {
  if (key == 'p' || key == 'P') {
      mystate = State.PAUSE;
    }
    
    if (key == 's' || key == 's') {
      mystate = State.RUN;
    }

}
