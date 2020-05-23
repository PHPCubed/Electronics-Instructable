/**
 * @author Trieu Vi Tran - 15800120
 * @version 1.0.0
 */

// const services = {
//     motion: {
//         name: 'Motion Service',
//         uuid: 'f000aa80-0451-4000-b000-000000000000'
//     }
// }

// const characteristics = {
//     motion: {
//         data: {
//             name: 'Data',
//             uuid: 'f000aa81-0451-4000-b000-000000000000'
//         },
//         config: {
//             name: 'Config',
//             uuid: 'f000aa82-0451-4000-b000-000000000000'
//         },
//         period: {
//             name: 'Period',
//             uuid: 'f000aa83-0451-4000-b000-000000000000'
//         }
//     }
// }

// let options = {
//     // acceptAllDevices: true,
//     filters: [
//         { name: 'CC2650 SensorTag' }
//     ],
//     optionalServices: [services.motion.uuid]
// };

var self2;
var state2 = {};

class MotionSensor2 {
    constructor() {
        self2 = this;
        
        this.services = services;
        this.characteristics = characteristics;
        this.accRange;
    }

    connect() {
        if (self2.device === undefined || !self2.device.connected) {
            return navigator.bluetooth.requestDevice(options)
                .then(device => {
                    console.log('Found device');
                    self2.device = device;
                    return self2.device.gatt.connect();
                })
                .then(server => {
                    console.log('Connect to server');
                    self2.server = server;
                    self2.getServices(self2.server, [self2.services.motion.uuid],
                        [self2.characteristics.motion.data.uuid, self2.characteristics.motion.config.uuid,
                        self2.characteristics.motion.period.uuid]);
                    // self2.getMotion(self2.server, self2.services.motion.uuid,
                    //     self2.characteristics.motion.data.uuid, self2.characteristics.motion.config.uuid,
                    //     self2.characteristics.motion.period.uuid);
                })
                .catch(error => {
                    console.trace('Error: ' + error);
                })
        } else {
            alert()
            console.log("This device is connected")
        }
    }

    disconnect() {
        console.log('Disconnect device');
        self2.server.disconnect();
    }

    reconnect() {
        if (self2.device !== undefined && !self2.device.connected) {
            console.log('Reconnect previous device');
            self2.device.connect();
        }
        else {
            console.log('No previous device')
            alert('No previous device connected');
        }
    }

    getServices(server, services, characteristics) {
        self2.getMotion(server, services[0], characteristics[0], characteristics[1], characteristics[2]);
    }

    getMotion(server, service, dataChar, configChar, periodChar) {
        var pointer;
        server.getPrimaryService(service)
            .then(s => {
                console.log('Get Motion Service');
                pointer = s;
                return pointer.getCharacteristic(configChar);
            })
            .then(config => {
                // Byte 1:
                // 0 0 0 0 0 0 0 0
                // ^ ^ ^ ^ ^ ^ ^ ^
                // | | | | | | | |
                // | | | | | | | Gyro Z
                // | | | | | | Gyro Y
                // | | | | | Gyro X
                // | | | | Accel. Z
                // | | | Accel. Y
                // | | Accel. X
                // | Magnetometer (all axes)
                // Wake up on motion

                // Byte 2:
                // 0 0 0 0 0 0 0 0
                //             ^ ^
                //             | |
                //             Accelerometer range (0 (00)=2G, 1 (01)=4G, 2 (10)=8G, 3 (11)=16G)

                console.log('Get Motion Config');
                self2.accRange = 2;
                let value = new Uint8Array([0b01111111, 0x02]);
                return config.writeValue(value);
            })
            .then(_ => {
                console.log('Change period to ' + 1 + 'ms');
                return pointer.getCharacteristic(periodChar);
            })
            .then(period => {
                let value = new Uint8Array([0x0A]);
                return period.writeValue(value);
            })
            .then(_ => {
                console.log('Finish writing to config');
                return pointer.getCharacteristic(dataChar);
            })
            .then(data => {
                console.log('Enable notification for Motion');
                data.startNotifications()
                    .then(_ => {
                        data.addEventListener('characteristicvaluechanged', self2.handleMotion);
                    });
            })
            .catch(e => {
                console.trace('Error' + e);
            })
    }

    handleMotion(event) {
        /* GyroX[0:7], GyroX[8:15],
        GyroY[0:7], GyroY[8:15],
        GyroZ[0:7], GyroZ[8:15],
        AccX[0:7], AccX[8:15],
        AccY[0:7], AccY[8:15],
        AccZ[0:7], AccZ[8:15],
        MagX[0:7], MagX[8:15],
        MagY[0:7], MagY[8:15],
        MagZ[0:7], MagZ[8:15] */

        // 16 bytes
        let raw_data = event.target.value;
        // console.log(raw_data);

        var gyroData = {};

        gyroData.x = self2.gyroConvert(raw_data.getInt16(0, true));
        gyroData.y = self2.gyroConvert(raw_data.getInt16(2, true));
        gyroData.z = self2.gyroConvert(raw_data.getInt16(4, true));


        state2.gyroData = gyroData;

        var accData = {};

        accData.x = self2.accConvert(raw_data.getInt16(6, true));
        accData.y = self2.accConvert(raw_data.getInt16(8, true));
        accData.z = self2.accConvert(raw_data.getInt16(10, true));

        state2.accData = accData;

        var magData = {};

        magData.x = self2.magConvert(raw_data.getInt16(12, true));
        magData.y = self2.magConvert(raw_data.getInt16(14, true));
        magData.z = self2.magConvert(raw_data.getInt16(16, true));

        state2.magData = magData;

        // console.table(state2);

        self2.onStateChangeCallback(state2);
    }

    gyroConvert(data) {
        // Calculate rotation, unit deg/s, range -250, +250
        return (data * 1.0) / (65536 / 500);
    }

    accConvert(data) {
        var v;

        switch (self2.accRange) {
            case 0:
                // console.log('2G');
                // Calculate acceleration, unit G, range -2, +2
                v = (data * 1.0) / (32768 / 2);
                break;

            case 1:
                // console.log('4G');
                // Calculate acceleration, unit G, range -4, +4
                v = (data * 1.0) / (32768 / 4);
                break;

            case 2:
                // console.log('8G');
                // Calculate acceleration, unit G, range -8, +8
                v = (data * 1.0) / (32768 / 8);
                break;

            case 3:
                // console.log('16G');
                // Calculate acceleration, unit G, range -16, +16
                v = (data * 1.0) / (32768 / 16);
                break;
        }

        return v;
    }

    magConvert(data) {
        // Calculate magnetism, unit uT, range +-4900
        return 1.0 * data;
    }

    onStateChangeCallback() { }

    onStateChange(callback) {
        self2.onStateChangeCallback = callback;
    }
}
