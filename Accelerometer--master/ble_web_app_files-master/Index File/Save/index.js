/**
 * @author Trieu Vi Tran - 15800120
 * @version 3.0
 */

/**
 * Waiting for site to load before running
 */
 function SaveDatFileBro(localstorage) {
  localstorage.root.getFile("info.txt", {create: true});
}
window.onload = function () {
    // Check if browser support Web bluetooth API
    if ('bluetooth' in navigator === false) {
        alert('Browser does not support the Web Bluetooth API');
    }

    let conB1 = document.getElementById('connect1');
    let disB1 = document.getElementById('disconnect1');
    
    let ti_sensortag1;
    let gyroDataReal1 = [];
    let gyroDataSmoothed1 = [];

    let accDataReal1 = [];
    let accDataSmothed1 = [];

    let timeDataReal1= [];

    var currentDate = new Date();


    conB1.onclick = e => {
        if (ti_sensortag1 === undefined || ti_sensortag1 === null) {
            ti_sensortag1 = new MotionSensor();
            ti_sensortag1.connect();

            ti_sensortag1.onStateChange(state => {
                gyroDataReal1.push(state.gyroData);
                accDataReal1.push(state.accData);
         var fileName = '';
        fileName += '_' + currentDate.getDate();
        fileName += '_' + (currentDate.getMonth() + 1);
        fileName += '_' + currentDate.getFullYear();
        //var time = new Date().getTime();
        //var date = new Date(time);
	var d = new Date();
	var h = addZero(d.getHours(), 2);
	var m = addZero(d.getMinutes(), 2);
	var s = addZero(d.getSeconds(), 2);
	var ms = addZero(d.getMilliseconds(), 3);
	var fullDate = h + ":" + m + ":" + s + ":" + ms;

	function addZero(x, n) {
    		while (x.toString().length < n) {
        		x = "0" + x;
    		}
    		return x;
	}

        // var time = currentDate.getTime();


        // fileName += '_' + currentDate.getHours();
        // fileName += '_' + currentDate.getMinutes();
        fileName += '_' + fullDate;

                console.log(fileName+"(",state.accData);

                smoothingData1();
                displayData1();

            })
        } else {
            alert("This device is connected")
            console.log("This device is connected")
        }
    }

    function displayData1() {
         let tempGyro = gyroDataReal1[gyroDataReal1.length - 1];
        //let tempGyro = gyroDataSmoothed1[gyroDataSmoothed1.length - 1];

        if (tempGyro) {
            document.getElementById('gyroX1').innerHTML = tempGyro.x;
            document.getElementById('gyroY1').innerHTML = tempGyro.y;
            document.getElementById('gyroZ1').innerHTML = tempGyro.z;

            //console.log(tempGyro.x+" , "+tempGyro.y+" , "+tempGyro.z);
            //console.log(tempGyro.x);
        }

        let tempAcc = accDataReal1[accDataReal1.length - 1];
        // let tempAcc = accDataSmothed1[accDataSmothed1.length - 1];

        if (tempAcc) {
            document.getElementById('accX1').innerHTML = tempAcc.x;
            document.getElementById('accY1').innerHTML = tempAcc.y;
            document.getElementById('accZ1').innerHTML = tempAcc.z;

            //console.log(tempAcc.x);

        }
        
        let tempTime = timeDataReal1[timeDataReal1.length - 1];
        
        if (tempTime) {
            document.getElementById('accX1').innerHTML = tempAcc.x;
    }

    function smoothingData1() {

        // var numbertoaverage = 5;
        // var counter = 0;
        // Average filter by n
        var n = 1;

        // console.log(accDataReal1.length);

        // var tempAX=0;
        // var tempAY=0;
        // var tempAZ=0;
        // if (accDataReal1.length>5){
        //     var tempAcc = accDataReal1.slice(-n);
        //     tempAX = tempAX + accDataReal1

        // }
        // if (gyroDataReal1.length < 5) {
        //     gyroDataSmoothed1.push(gyroDataReal1[gyroDataReal1.length - 1]);
        // } else {
        //     var tempGyro = gyroDataReal1.slice(-n);
        //     var tempX = tempGyro.reduce((a, v) => a + v.x);
        //     var tempY = tempGyro.reduce((a, v) => a + v.y);;
        //     var tempZ = tempGyro.reduce((a, v) => a + v.z);;

        //     gyroDataSmoothed1.push({x: tempX, y: tempY, z: tempZ});
        // }

        // console.log(accDataReal1.length);


        if (accDataReal1.length < n) {


            accDataSmothed1.push(accDataReal1[accDataReal1.length - 1]);
        } else {

            //var tempAcc = accDataReal1.slice(-n);
            var tempX=0;
            var tempY=0;
            var tempZ=0;

            for (var i=1;i<=n;i++){

                //console.log(accDataReal1[accDataReal1.length-i].x);

                tempX=  tempX+accDataReal1[accDataReal1.length-i].x;
                tempY=  tempY+accDataReal1[accDataReal1.length-i].y;
                tempZ=  tempZ+accDataReal1[accDataReal1.length-i].z;
            }

            var averageX = tempX/n;
            var averageY = tempY/n;
            var averageZ = tempZ/n;

            // var roundedX = Math.round(averageX * 1000) / 100;
            // var roundedY = Math.round(averageY * 1000) / 100;
            // var roundedZ = Math.round(averageZ * 1000) / 100;

           // console.log(averageX.toFixed(2)+" "+averageY.toFixed(2)+" "+averageZ.toFixed(2));

           // accDataSmothed1.push({x:roundedX, y: roundedY, z: roundedZ});
            // var tempX = tempAcc.reduce((a, v) => a + v.x);
            // var tempY = tempAcc.reduce((a, v) => a + v.y);;
            // var tempZ = tempAcc.reduce((a, v) => a + v.z);;

            // accDataSmothed1.push({x: tempX, y: tempY, z: tempZ});
        }

        // for (int i=0;i<)
//                console.log(accDataSmothed1[accDataSmothed1.length - 1]);

    }

    disB1.onclick = e => {
        ti_sensortag1.disconnect();
    }

    let conB2 = document.getElementById('connect2');
    let disB2 = document.getElementById('disconnect2');

    let ti_sensortag2;
    let gyroDataReal2 = [];
    let gyroDataSmoothed2 = [];

    let accDataReal2 = [];
    let accDataSmoothed2 = [];

    conB2.onclick = e => {
        if (ti_sensortag2 === undefined || ti_sensortag2 === null) {
            ti_sensortag2 = new MotionSensor2();
            ti_sensortag2.connect();

            ti_sensortag2.onStateChange(state => {
                gyroDataReal2.push(state.gyroData);
                accDataReal2.push(state.accData);

                smoothingData2();

                displayData2();
            })
        } else {
            alert("This device is connected")
            console.log("This device is connected")
        }
    }

    disB2.onclick = e => {
        ti_sensortag2.disconnect();
    }

    function displayData2() {
        // let tempGyro = gyroDataReal2[gyroDataReal2.length - 1];
        let tempGyro = gyroDataSmoothed2[gyroDataSmoothed2.length - 1];

        if (tempGyro) {
            document.getElementById('gyroX2').innerHTML = tempGyro.x;
            document.getElementById('gyroY2').innerHTML = tempGyro.y;
            document.getElementById('gyroZ2').innerHTML = tempGyro.z;
        }

        // let tempAcc = accDataReal2[accDataReal2.length - 1];
        let tempAcc = accDataSmoothed2[accDataSmoothed2.length - 1];

        if (tempAcc) {
            document.getElementById('accX2').innerHTML = tempAcc.x;
            document.getElementById('accY2').innerHTML = tempAcc.y;
            document.getElementById('accZ2').innerHTML = tempAcc.z;
        }
    }

    function smoothingData2() {
        // Average filter by n
        var n = 5;
        if (gyroDataReal2.length < 5) {
            gyroDataSmoothed2.push(gyroDataReal2[gyroDataReal2.length - 1]);
        } else {
            var tempGyro = gyroDataReal2.slice(-n);
            var tempX = tempGyro.reduce((a, v) => a + v.x);
            var tempY = tempGyro.reduce((a, v) => a + v.y);;
            var tempZ = tempGyro.reduce((a, v) => a + v.z);;

            gyroDataSmoothed2.push({x: tempX, y: tempY, z: tempZ});
        }

        if (accDataReal2.length < 5) {
            accDataSmothed2.push(accDataReal2[accDataReal2.length - 1]);
        } else {
            var tempAcc = accDataReal2.slice(-n);
            var tempX = tempAcc.reduce((a, v) => a + v.x);
            var tempY = tempAcc.reduce((a, v) => a + v.y);;
            var tempZ = tempAcc.reduce((a, v) => a + v.z);;

            accDataSmothed2.push({x: tempX, y: tempY, z: tempZ});
        }
    }

    let downloadButton= document.getElementById('download');

    downloadButton.onclick = e => {
        console.log("Download butoon is clicked");
        console.log('Generating text for download')
        
        var text = '';
        if (ti_sensortag1 !== undefined) {
            var n = gyroDataReal1.length;
            text += 'Tag 1\n';
            text += generatingText(gyroDataReal1, n, 'gyro');
            text += generatingText(accDataReal1, n, 'acc');
            text += generatingText(fullDate, n ,time);
        }
        
        if (ti_sensortag2 !== undefined) {
            var n = gyroDataReal2.length - 1;
            text += 'Tag 2\n';
            text += generatingText(gyroDataReal2, n, 'gyro');
            text += generatingText(accDataReal2, n, 'acc');
        }

        var currentDate = new Date();
        var fileName = 'motionData';
        fileName += '_' + currentDate.getDate();
        fileName += '_' + currentDate.getMonth();
        fileName += '_' + currentDate.getFullYear();

        fileName += '_' + currentDate.getHours();
        fileName += '_' + currentDate.getMinutes();

        console.log("Generating download file");

        // Limited to 500MB
        // Use 3rd party library to donwload bigger file EG: FileSaver.js or StreamSaver.js
        download(fileName + '.txt',text);

    }

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
    
        element.style.display = 'none';
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
    }

    function generatingText(data, size, name) {
        var x = name + 'X';
        var y = name + 'Y';
        var z = name + 'Z';
        for (var i = 0; i < size; i++) {
            x += ' ' + data[i].x;
            y += ' ' + data[i].y;
            z += ' ' + data[i].z;
        }

        return '\n' + x + '\n' + y + '\n' + z + '\n';
    }
}
