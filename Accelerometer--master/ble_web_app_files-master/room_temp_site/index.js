/**
 * @author Trieu Vi Tran - 15800120
 * @version 1.0.0
 */

 /**
  * Waiting for site to load before running
  */
 window.onload = function() {
  let conButton = document.getElementById('connect');
  let disButton = document.getElementById('disconnect');
  
  // Check if browser support Web bluetooth API
  if ('bluetooth' in navigator === false) {
      alert('Browser does not support the Web Bluetooth API');
  }

  let ti_sensortag;
  let modelName;
  let irTempC;

  conButton.onclick = e => {
      ti_sensortag = new TISensorTag();
      ti_sensortag.connect();

      ti_sensortag.onStateChange(state => {
          modelName = state.modelName;
          irTempC = state.tempC;

          displayData();
      })
  }

  function displayData() {
      if (modelName) {
          let modelNamediv = document.getElementById('modelName');
          modelNamediv.innerHTML = modelName;
      }

      if (irTempC) {
        let irTempdiv = document.getElementById('tempC');
        irTempdiv.innerHTML = irTempC;
      }
  }

  disButton.onclick = e => {
      ti_sensortag.disconnect();
  }
}
  