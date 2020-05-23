/**
 * @author Trieu Vi Tran - 15800120
 * @version 1.0.0
 */

/**
 * Waiting for site to load before running
 */
window.onload = function () {
    let conButton = document.getElementById('connect');
    let disButton = document.getElementById('disconnect');

    // Check if browser support Web bluetooth API
    if ('bluetooth' in navigator === false) {
        alert('Browser does not support the Web Bluetooth API');
    }

    let ti_sensortag;
    let gyroData;
    let accData;
    let magData;

    conButton.onclick = e => {
        ti_sensortag = new MotionSensor();
        ti_sensortag.connect();

        ti_sensortag.onStateChange(state => {
            gyroData = state.gyroData;
            accData = state.accData;
            magData = state.magData;

            displayData();
        })
    }

    function displayData() {

        if (gyroData) {
            document.getElementById('gyroX').innerHTML = gyroData.x;
            document.getElementById('gyroY').innerHTML = gyroData.y;
            document.getElementById('gyroZ').innerHTML = gyroData.z;
        }

        if (accData) {
            document.getElementById('accX').innerHTML = accData.x;
            document.getElementById('accY').innerHTML = accData.y;
            document.getElementById('accZ').innerHTML = accData.z;
        }

        if (magData) {
            document.getElementById('magX').innerHTML = magData.x;
            document.getElementById('magY').innerHTML = magData.y;
            document.getElementById('magZ').innerHTML = magData.z;
        }
    }

    disButton.onclick = e => {
        ti_sensortag.disconnect();
    }
}
