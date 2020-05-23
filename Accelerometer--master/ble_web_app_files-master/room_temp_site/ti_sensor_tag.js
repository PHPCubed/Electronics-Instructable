/**
 * @author Trieu Vi Tran - 15800120
 * @version 1.2.0
 */

const services = {
    deviceInfo: {
        name: 'Device Information Service',
        uuid: '0000180a-0000-1000-8000-00805f9b34fb'
    },
    irTemp: {
        name: 'IR Temperature Service',
        uuid: 'f000aa00-0451-4000-b000-000000000000'
    },
    humidity: {
        name: 'Humidity Service',
        uuid: 'f000aa20-0451-4000-b000-000000000000'
    }
}

const characteristics = {
    deviceInfo:{ 
        modelName: {
            name: 'Model Number String',
            uuid: '00002a24-0000-1000-8000-00805f9b34fb'
        }
    },
    irTemp: {
        data: {
            name: 'IR Temperature Data',
            uuid: 'f000aa01-0451-4000-b000-000000000000'
        },
        config: {
            name: 'IR Temperature Configuration',
            uuid: 'f000aa02-0451-4000-b000-000000000000'
        },
        period: {
            name: 'IR Temperature Period',
            uuid: 'f000aa03-0451-4000-b000-000000000000'
        }
    },
    humidity: {
        data: {
            name: 'Humidity Data',
            uuid: 'f000aa21-0451-4000-b000-000000000000'
        },
        config: {
            name: 'Humidity Configuration',
            uuid: 'f000aa22-0451-4000-b000-000000000000'
        },
        period: {
            name: 'Humidity Period',
            uuid: 'f000aa23-0451-4000-b000-000000000000'
        }
    }
}

let options = {
    //acceptAllDevices: true,
	filters: [
            {name: 'CC2650 SensorTag'}
    ],
    optionalServices: [services.deviceInfo.uuid, services.irTemp.uuid]
};

var self;
var state = {};

class TISensorTag {
    constructor() {
        self = this;
        this.device;
        this.server;
        this.name;
        this.modelName;
        this.temperatureC;
        this.services = services;
        this.characteristics = characteristics;
        this.cService;
    }

    connect() {
        return navigator.bluetooth.requestDevice(options)
        .then(device => {
            console.log('Found device');
            self.device = device;
            self.name = device.name;
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Connect to server');
            self.server = server;
            self.getServices(self.server, [self.services.deviceInfo, self.services.irTemp], [self.characteristics.deviceInfo.modelName, self.characteristics.irTemp.data, self.characteristics.irTemp.config, self.characteristics.irTemp.period]);
        })
        .catch(error => {
            console.trace('Error: ' + error);
        })
    }

    disconnect() {
        console.log('Disconnect device');
        self.server.disconnect();
    }

    getServices(server, services, characteristics) {
        self.getModelName(server, services[0], characteristics[0]);
        self.getIRTemperature(server, services[1], characteristics.slice(1));
    }

    getIRTemperature(server, service, chars) {
        console.log('Get IR Temp Data');
        server.getPrimaryService(service.uuid)
        .then(service => {
            console.log('Temperature Config');
            self.cService = service;
            return self.cService.getCharacteristic(chars[1].uuid);
        })
        .then(charConfig => {
            console.log('Enable Temperature reading');
            var value = new Uint8Array([0x01]);
            return charConfig.writeValue(value);
        })
        .then(_ => {
            console.log('Retrieve Temperature Data');
            return self.cService.getCharacteristic(chars[0].uuid);
        })
        .then(charData => {
            console.log('Enable notification for temperature');
            charData.startNotifications()
            .then(_ => {
                charData.addEventListener('characteristicvaluechanged', self.handleTempChange);
            });
        })
        .catch(error => {
            console.trace('Error: ' + error);
        });
    }

    getModelName(server, service, char) {
        console.log('Get Model Name');
        server.getPrimaryService(service.uuid)
        .then(service => {
            return service.getCharacteristic(char.uuid);
        })
        .then(char => {
            return char.readValue();
        })
        .then(values => {
            let temp = '';
            for (var i = 0; i < 16; i++) {
                temp += String.fromCharCode(values.getUint8(i));
            }

            state.modelName = temp;
            console.log(temp);

            self.onStateChangeCallback(state);
        })
        .catch(error => {
            console.trace('Error: ' + error);
        });
    }

    handleTempChange(event) {
        // byteLength of ir data is 4
        // v1 = getUint8(3) must be length 2
        // v2 = getUint8(2) must be length 2
        // data = parseInt('0x' + v1.toString(16) + v2.toString(16), 16)
        // result = (t >> 2 & 0x3FFF) * 0.03125
        let raw_data = event.target.value;
        //console.log(raw_data);

        //let temp1 = raw_data.getUint8(3).toString(16);
        //temp1 = temp1.length < 2 ? '0' + temp1 : temp1;

        //let temp2 = raw_data.getUint8(2).toString(16);
        //temp2 = temp2.length < 2 ? '0' + temp2 : temp2;

        //let raw_ambient_temp = parseInt('0x' + temp1 + temp2, 16);
		//console.log(raw_ambient_temp);
		
		//let d1 = raw_data.getUint8(2);
		//let d2 = raw_data.getUint8(3);
		
		//let raw_ambient_temp = (d2 << 8) | d1;
		let raw_ambient_temp = raw_data.getUint16(2, true);
        let ambient_temp_int = raw_ambient_temp >> 2 & 0x3FFF;
        let resultC = ambient_temp_int * 0.03125;
        
        state.tempC = resultC;
        console.log(resultC);

        self.onStateChangeCallback(state);
    }

    onStateChangeCallback() {}

    onStateChange(callback){
        self.onStateChangeCallback = callback;
    }
}
