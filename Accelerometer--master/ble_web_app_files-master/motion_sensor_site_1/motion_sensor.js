/**
 * @author Trieu Vi Tran - 15800120
 * @version 1.0.0
 */

const services = {
    motion: {
        name: 'Motion Service',
        uuid: 'f000aa80-0451-4000-b000-000000000000'
    }
}

const characteristics = {
    motion: {
        data: {
            name: 'Data',
            uuid: 'f000aa81-0451-4000-b000-000000000000'
        },
        config: {
            name: 'Config',
            uuid: 'f000aa82-0451-4000-b000-000000000000'
        },
        period: {
            name: 'Period',
            uuid: 'f000aa83-0451-4000-b000-000000000000'
        }
    }
}

let options = {
    // acceptAllDevices: true,
    filters: [
        { name: 'CC2650 SensorTag' }
    ],
    optionalServices: [services.motion.uuid]
};

var self;
var state = {};

class MotionSensor {
    constructor() {
        self = this;
        this.services = services;
        this.characteristics = characteristics;
        this.accRange;
    }

    connect() {
        return navigator.bluetooth.requestDevice(options)
            .then(device => {
                console.log('Found device');
                self.device = device;
                return device.gatt.connect();
            })
            .then(server => {
                console.log('Connect to server');
                self.server = server;
                self.getServices(self.server, [self.services.motion.uuid],
                    [self.characteristics.motion.data.uuid, self.characteristics.motion.config.uuid,
                    self.characteristics.motion.period.uuid]);
                // self.getMotion(self.server, self.services.motion.uuid,
                //     self.characteristics.motion.data.uuid, self.characteristics.motion.config.uuid,
                //     self.characteristics.motion.period.uuid);
            })
            .catch(error => {
                console.trace('Error: ' + error);
            })
    }

    disconnect() {
        console.log('Disconnect device');
        self.server.disconnect();
    }

    reconnect() {
        if (self.device !== null) {
            console.log('Reconnect previous device');
            self.device.connect();
        }
        else {
            console.log('No previous device')
            alert('No previous device connected');
        }
    }

    getServices(server, services, characteristics) {
        self.getMotion(server, services[0], characteristics[0], characteristics[1], characteristics[2]);
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
                self.accRange = 2;
                let value = new Uint8Array([0b01111111, 0x02]);
                return config.writeValue(value);
            })
            .then(_ => {
                //code
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
                        data.addEventListener('characteristicvaluechanged', self.handleMotion);
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

        gyroData.x = self.gyroConvert(raw_data.getInt16(0, true));
        gyroData.y = self.gyroConvert(raw_data.getInt16(2, true));
        gyroData.z = self.gyroConvert(raw_data.getInt16(4, true));


        state.gyroData = gyroData;

        var accData = {};

        accData.x = self.accConvert(raw_data.getInt16(6, true));
        accData.y = self.accConvert(raw_data.getInt16(8, true));
        accData.z = self.accConvert(raw_data.getInt16(10, true));

        state.accData = accData;

        var magData = {};

        magData.x = self.magConvert(raw_data.getInt16(12, true));
        magData.y = self.magConvert(raw_data.getInt16(14, true));
        magData.z = self.magConvert(raw_data.getInt16(16, true));

        state.magData = magData;

        console.table(state);

        self.onStateChangeCallback(state);
    }

    gyroConvert(data) {
        // Calculate rotation, unit deg/s, range -250, +250
        return (data * 1.0) / (65536 / 500);
    }

    accConvert(data) {
        var v;

        switch (self.accRange) {
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
        self.onStateChangeCallback = callback;
    }
}
