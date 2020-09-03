var FilePlugin = {     
                    callNativeFunction: function (success, fail, resultType) {
                        return cordova.exec( success, fail, 
                                            "FilePlugin", 
                                            "nativeAction", [resultType]);     
    } 
};
module.exports = FilePlugin;