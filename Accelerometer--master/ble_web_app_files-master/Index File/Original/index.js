/**
 * @author Trieu Vi Tran - 15800120
 * @version 3.0
 */

/**
 * Waiting for site to load before running
 */
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

    conB1.onclick = e => {
        if (ti_sensortag1 === undefined || ti_sensortag1 === null) {
            ti_sensortag1 = new MotionSensor();
            ti_sensortag1.connect();

            ti_sensortag1.onStateChange(state => {
                gyroDataReal1.push(state.gyroData);
                accDataReal1.push(state.accData);

                smoothingData1();

                displayData1();
            })
        } else {
            alert("This device is connected")
            console.log("This device is connected")
        }
    }

    function displayData1() {
        // let tempGyro = gyroDataReal1[gyroDataReal1.length - 1];
        let tempGyro = gyroDataSmoothed1[gyroDataSmoothed1.length - 1];

        if (tempGyro) {
            document.getElementById('gyroX1').innerHTML = tempGyro.x;
            document.getElementById('gyroY1').innerHTML = tempGyro.y;
            document.getElementById('gyroZ1').innerHTML = tempGyro.z;
        }

        // let tempAcc = accDataReal1[accDataReal1.length - 1];
        let tempAcc = accDataSmothed1[accDataSmothed1.length - 1];

        if (tempAcc) {
            document.getElementById('accX1').innerHTML = tempAcc.x;
            document.getElementById('accY1').innerHTML = tempAcc.y;
            document.getElementById('accZ1').innerHTML = tempAcc.z;
        }
    }

    function smoothingData1() {
        // Average filter by n
        var n = 5;
        if (gyroDataReal1.length < 5) {
            gyroDataSmoothed1.push(gyroDataReal1[gyroDataReal1.length - 1]);
        } else {
            var tempGyro = gyroDataReal1.slice(-n);
            var tempX = tempGyro.reduce((a, v) => a + v.x);
            var tempY = tempGyro.reduce((a, v) => a + v.y);;
            var tempZ = tempGyro.reduce((a, v) => a + v.z);;

            gyroDataSmoothed1.push({x: tempX, y: tempY, z: tempZ});
        }

        if (accDataReal1.length < 5) {
            accDataSmothed1.push(accDataReal1[accDataReal1.length - 1]);
        } else {
            var tempAcc = accDataReal1.slice(-n);
            var tempX = tempAcc.reduce((a, v) => a + v.x);
            var tempY = tempAcc.reduce((a, v) => a + v.y);;
            var tempZ = tempAcc.reduce((a, v) => a + v.z);;

            accDataSmothed1.push({x: tempX, y: tempY, z: tempZ});
        }
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
