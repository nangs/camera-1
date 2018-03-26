//import RNFetchBlob from 'react-native-fetch-blob';



export default {
    readFile(filePath) {
        //return RNFetchBlob.fs.readFile(filePath, 'base64').then(data => new Buffer(data, 'base64'));

        console.log("hey:",filePath);
        return new Promise((resolve, reject) => {
            fetch(filePath).then((response) =>  {
                console.log(response);
                return resolve(response.blob());
            }).catch((err) => {
                console.log("a",err);

                return reject(err);
            });
        })
    },
};