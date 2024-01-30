import { Platform, PixelRatio, PermissionsAndroid } from 'react-native';

const search_timeout = 1000 * 60 * 10; // 10 minutes
const share_timeout = 1000 * 60 * 5; // 5 minutes

function getPixelSize(pixels) {
    return Platform.select({
      ios: pixels,
      android: PixelRatio.getPixelSizeForLayoutSize(pixels)
    });
}

const checkAndroidPermissions = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                title: "Almalak App", 
                message: "Almalak App needs to use your location to show routes and search for a ride",          
                buttonNeutral: "Ask Me Later", buttonNegative: "Cancel", buttonPositive: "OK"
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
            console.log("You can use the geolocation");
        } else {
            return false;
            console.log("Geolocation permission denied");
        }
    } 
    catch (err) { console.warn(err); }
}

const calculateFare = (baseFare, timeRate, time,  distanceRate, distance, surge) => {
    const distanceInKm = distance * 0.001; /*1KM 1000 Meter --  1÷1000 */
    const pricePerKm = distanceRate * distanceInKm;
    const timeInMin = time * 0.0166667; /* 1÷60 */
    const pricePerMinute = timeRate * timeInMin;
    const totalFare = (baseFare + pricePerKm + pricePerMinute) * surge;
    return Math.round(totalFare);
};

function regionFrom(lat, lon, accuracy) {
    const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
    const circumference = (40075 / 360) * 1000;

    const latDelta = accuracy * (1 / (Math.cos(lat) * circumference));
    const lonDelta = (accuracy / oneDegreeOfLongitudeInMeters);

    return {
        latitude: lat,
        longitude: lon,
        latitudeDelta: Math.max(0, latDelta),
        longitudeDelta: Math.max(0, lonDelta)
    };
}


function geoErr(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED: console.log("User denied the request for Geolocation."); 
        break;
        case error.POSITION_UNAVAILABLE: console.log('Location information is unavailable.');
        break;
        case error.TIMEOUT: console.log('The request to get user location timed out.');
        break;
        case error.UNKNOWN_ERROR: console.log('An unknown error occurred.' + error);
        break;
    }
}

function getLatLonDiffInMeters(lat1, lon1, lat2, lon2) {
    var R = 6371; // radius of the earth in km
    var dLat = deg2rad(lat2-lat1); // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // distance in km
    return d * 1000;
}

const deg2rad = (deg) => {
    return deg * (Math.PI/180);
}

export { 
    getPixelSize, 
    checkAndroidPermissions, 
    calculateFare, 
    regionFrom, 
    getLatLonDiffInMeters,
    geoErr
};