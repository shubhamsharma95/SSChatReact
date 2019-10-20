import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TextInput,
    Button,
    TouchableOpacity,
    Image,
    Dimensions,
    SafeAreaView,
    Alert,
    KeyboardAvoidingView
} from 'react-native';
import firebase from 'react-native-firebase'
import ImagePicker from 'react-native-image-picker';
import CustomImage from './cusomComponents/CustomImage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import appStyles, { colors, appColors } from './styles/common/index.style';


// const { width, height } = Dimensions.get('window');
const height = Dimensions.get('window').height - 220;

class Constant {
    static MESSAGE_TYPE_TXT = "txt"
    static MESSAGE_TYPE_IMAGE = "image"
}

export default class ChatScreen extends React.Component {

    // MESSAGE_TYPE_TXT = "txt"
    chatRef;
    currentUser = firebase.auth().currentUser;
    constructor(props) {
        super(props);
        this.state = { list: [], message: "", userID: 'w2JKh5BwWIcJ9SJuw7smR8KCaJ12' }

        this.renderItem = this._renderItem.bind(this);

        const { navigation } = this.props;
        const userID = navigation.getParam('userID', 'w2JKh5BwWIcJ9SJuw7smR8KCaJ12');
        this.state.userID = userID
        // Alert.alert("Alert", this.state.userID);
        this.chatRef = firebase.database().ref("chat/" + this.fetchLower(userID, this.currentUser.uid));
    }

    fetchLower(str1, str2) {
        if (str1.localeCompare(str2) < 0) {
            return str1 + "_" + str2
        } else {
            return str2 + "_" + str1
        }
    }
    componentDidMount() {

        this.chatRef.on('child_added', (snapshot) => {
            var item = snapshot.val();

            let oldList = this.state.list;
            let obj = {
                message: item.message,
                media: item.media,
                type: item.type,
                sent: (item.userID == this.currentUser.uid)
            }

            console.log(obj)
            oldList.push(obj);
            this.setState({ list: oldList })
        });
    }
    changeDP() {

        // well that came from https://github.com/react-native-community/react-native-image-picker
        // More info on all the options is below in the API Reference... just some common use cases shown here
        const options = {
            title: 'Select Media way',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        /**
         * The first arg is the options object for customization (it can also be null or omitted for default options),
         * The second arg is the callback which sends object: response (more info in the API Reference)
         */
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                console.log(response)
                // const source = { uri: response.uri };

                // You can also display the image using data:
                const source = { uri: 'data:image/jpeg;base64,' + response.data };
                var storageRef = firebase.storage().ref();

                let path = 'media/images/' + Date.now() + "_" + this.currentUser.uid + '.jpg'
                // Create a reference to 'mountains.jpg'
                var mountainsRef = storageRef.child(path);
                var metadata = {
                    contentType: 'image/jpeg',
                };
                var uploadTask = mountainsRef.put(response.uri, metadata);


                // Listen for state changes, errors, and completion of the upload.
                uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                    function (snapshot) {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case firebase.storage.TaskState.PAUSED: // or 'paused'
                                console.log('Upload is paused');
                                break;
                            case firebase.storage.TaskState.RUNNING: // or 'running'
                                console.log('Upload is running');
                                break;
                        }
                    }, function (error) {

                        // A full list of error codes is available at
                        // https://firebase.google.com/docs/storage/web/handle-errors
                        switch (error.code) {
                            case 'storage/unauthorized':
                                console.log(' User doesn\'t have permission to access the object')
                                break;

                            case 'storage/canceled':
                                console.log('User canceled the upload')
                                break;



                            case 'storage/unknown':
                                console.log(' Unknown error occurred, inspect error.serverResponse')
                                break;
                        }
                    }, () => {
                        // Upload completed successfully, now we can get the download URL
                        // uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                        //     console.log('File available at', downloadURL);
                        // });
                        this.sendMessage("", Constant.MESSAGE_TYPE_IMAGE, path)

                    });


                // var usersRef = firebase.database().ref("users/" + this.currentUser.uid + "/dp/");
                // usersRef.set(path)
                // this.setState({
                //     avatarSource: source,
                // });
            }
        });
    }
    onClickListener = (viewId) => {
        if (viewId == "send") {
            if (this.state.message != "") {
                this.sendMessage(this.state.message, Constant.MESSAGE_TYPE_TXT);
            }
        } else if (viewId == 'image') {
            this.changeDP();
        } else if (viewId == 'back') {
            this.props.navigation.goBack();
        } else {
            // Alert.alert("Alert", "Button pressed " + viewId);
        }

    }

    sendMessage(message, type, media = "") {

        this.chatRef.push({
            "message": message,
            "userID": this.currentUser.uid,
            "type": type,
            "media": media
        });
        this.state.message = ""

    }
    openChatScreen = (object) => {
        console.log(object)
    }
    goBack = () => {
        this.props.navigation.goBack();
    }
    _renderItem = ({ item }) => {

        console.log(item)
        if (item.type == Constant.MESSAGE_TYPE_IMAGE) {
            if (item.sent === false) {
                return (
                    <View style={styles.leftImageMsg}>
                        <View style={styles.leftImageBlock}>
                            <CustomImage src={item.media} style={styles.leftImageBlock} />
                            {/* <Text style={styles.msgTxt}>{item.message}</Text> */}
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={styles.rightImageMsg} >
                        <View style={styles.rightImageBlock} >
                            <CustomImage src={item.media} style={styles.rightImageBlock} />
                            {/* <Text style={styles.rightTxt}>{item.message}</Text> */}
                        </View>

                    </View>
                );
            }
        } else {
            if (item.sent === false) {
                return (
                    <View style={styles.eachMsg}>

                        <View style={styles.msgBlock}>
                            <Text style={styles.msgTxt}>{item.message}</Text>
                        </View>
                    </View>
                );
            } else {
                return (
                    <View style={styles.rightMsg} >
                        <View style={styles.rightBlock} >
                            <Text style={styles.rightTxt}>{item.message}</Text>
                        </View>

                    </View>
                );
            }
        }
    };

    //renderItem={({ item }) => <Text style={styles.item} onPress={this.openChatScreen.bind(this, item)} >{item.key}</Text>}
    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: "#000" }}>
                    <View style={{ flex: 1, }}>
                        <View style={styles.container}>
                            <View style={styles.toolbarWrapper}>
                                <TouchableOpacity activeOpacity={0.7}
                                    style={styles.backIconWrapper}
                                    onPress={() => this.onClickListener("back")}
                                >
                                    <Image source={require("./../assets/img/ic_back.png")}
                                        style={styles.backIcon} />

                                </TouchableOpacity>
                                <Text style={styles.toolbarTitle}>Chat</Text>
                            </View>
                            <View style={styles.messageList}>
                                <FlatList
                                    style={styles.messageListItself}
                                    data={this.state.list}
                                    extraData={this.state}
                                    renderItem={this.renderItem}
                                />
                            </View>
                            <View style={styles.bottomWrapper}>
                                <View style={styles.sendMessageContainer}>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            placeholderTextColor="#999797"
                                            style={styles.inputs}
                                            placeholder="TYPE HERE..."
                                            underlineColorAndroid='transparent'
                                            value={this.state.message}
                                            onChangeText={(message) => this.setState({ message })} />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.buttonContainer, styles.loginButton]}
                                        onPress={() => this.onClickListener('send')}>
                                        <Text style={styles.loginText}>Send</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.sendMediaContainer}>
                                    <TouchableOpacity style={[styles.bottomButtonIconsContainer]} onPress={() => this.onClickListener('image')}>
                                        <Image source={require("./../assets/img/ic_photo_camera.png")} style={styles.bottomButtonIcons}></Image>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.bottomButtonIconsContainer]} onPress={() => this.onClickListener('image')}>
                                        <Image source={{ uri: "https://img.icons8.com/ios/100/000000/image.png" }} style={styles.bottomButtonIcons}></Image>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.bottomButtonIconsContainer]} onPress={() => this.onClickListener('image')}>
                                        <Image source={{ uri: "https://img.icons8.com/ios/100/000000/image.png" }} style={styles.bottomButtonIcons}></Image>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.bottomButtonIconsContainer]} onPress={() => this.onClickListener('image')}>
                                        <Image source={{ uri: "https://img.icons8.com/ios/100/000000/image.png" }} style={styles.bottomButtonIcons}></Image>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: '#303030', // '#6b6d6e',

    },
    toolbarWrapper: {
        height: 90,
        backgroundColor: appColors.bgColor
    },
    backIconWrapper: {
        height: 25,
        width: 25,
        marginStart: 20,
        marginTop: 20,
    },
    backIcon: {
        height: 25,
        width: 25,
    },
    toolbarTitle: {
        color: "#d9983d",
        fontFamily: "IntroCondLightFree",
        marginTop: 10,
        marginStart: 30,
        fontSize: 30
    },
    messageList: {
        // height: 20,
        flex: 1,

        // height: 400
    },
    messageListItself: {
        height: height
    },
    bottomWrapper: {

        height: 100,
        // backgroundColor: '#aaa'
    },
    sendMessageContainer: {
        width: '100%',
        height: 45,
        marginBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        flex: 1
    },
    inputContainer: {
        // borderBottomColor: '#ddd',
        // backgroundColor: '#FFFFFF',
        // borderRadius: 0,
        // borderBottomWidth: 1,
        // height: 45,
        // flex: 3,
        // flexDirection: 'row',
        // alignItems: 'center',


        // backgroundColor: '#FFFFFF',
        // borderRadius: 30,
        // borderBottomWidth: 1,
        // marginStart: 20,
        // marginEnd: 20,
        // width: "100%",
        flex: 1,
        height: 45,
        // marginBottom: 20,
        flexDirection: 'row',
    },
    inputs: {
        borderBottomColor: '#d9983d',
        borderBottomWidth: 2,
        color: "#ededed",
        // backgroundColor: '#ddd',
        height: "100%",
        // marginLeft: 16,
        paddingStart: 30,
        // borderBottomColor: '#FFFFFF',
        flex: 1,
        fontFamily: "IntroCondLightFree"
    },
    buttonContainer: {
        height: 45,
        // flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: 0,
        width: 80,
    },
    loginButton: {
        backgroundColor: "#00b5ec",
    },
    loginText: {
        color: 'white',
    },
    sendMediaContainer: {
        width: '100%',
        height: 45,
        // marginBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 0,
        flex: 1,
        backgroundColor: '#242424',
        justifyContent: 'space-around',
    },
    bottomButtonIconsContainer: {
        width: 30,
        height: 30,

        // backgroundColor: '#303030'
    },
    bottomButtonIcons: {
        width: 30,
        height: 30,
    },


    //--------------------------------
    leftImageMsg: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        margin: 5,
    },
    leftImageBlock: {
        width: 100,
        height: 100,
        borderRadius: 5,
        backgroundColor: '#ffffff',
        padding: 1,
        shadowColor: '#3d3d3d',
        shadowRadius: 2,
        shadowOpacity: 0.5,
        shadowOffset: {
            height: 1,
        },
    },
    rightImageMsg: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        margin: 5,
        alignSelf: 'flex-end',
    },
    rightImageBlock: {
        width: 100,
        height: 100,
        borderRadius: 5,
        backgroundColor: '#ffffff',
        padding: 1,
        shadowColor: '#3d3d3d',
        shadowRadius: 2,
        shadowOpacity: 0.5,
        shadowOffset: {
            height: 1,
        },
    },
    eachMsg: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        margin: 5,
    },
    msgBlock: {
        width: '80%',
        borderRadius: 5,
        backgroundColor: '#ffffff',
        padding: 10,
        shadowColor: '#3d3d3d',
        shadowRadius: 2,
        shadowOpacity: 0.5,
        shadowOffset: {
            height: 1,
        },
    },
    msgTxt: {
        fontSize: 15,
        color: '#555',
        fontWeight: '600',
    },
    rightMsg: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        margin: 5,
        alignSelf: 'flex-end',
    },
    rightBlock: {
        width: '80%',
        borderRadius: 3,
        backgroundColor: '#0F84FE',
        padding: 10,
        shadowColor: '#0F84FE',
        shadowRadius: 2,
        shadowOpacity: 0.5,
        shadowOffset: {
            height: 1,
        },
    },
    rightTxt: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },




















    /* 
        item: {
            padding: 10,
            fontSize: 18,
            height: 44,
        },  
        keyboard: {
            flex: 1
        },
    
        header: {
            height: 65,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#075e54',
        },
        left: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        right: {
            flexDirection: 'row',
        },
        chatTitle: {
            color: '#fff',
            fontWeight: '600',
            margin: 10,
            fontSize: 15,
        },
        chatImage: {
            width: 30,
            height: 30,
            borderRadius: 15,
            margin: 5,
        },
    
    
        input: {
            flexDirection: 'row',
            alignSelf: 'flex-end',
            padding: 10,
            height: 40,
            // width: width - 20,
            backgroundColor: '#fff',
            margin: 10,
            shadowColor: '#3d3d3d',
            shadowRadius: 2,
            shadowOpacity: 0.5,
            shadowOffset: {
                height: 1,
            },
            borderColor: '#696969',
            borderWidth: 1,
        },
        
        
        
        
        userPic: {
            height: 40,
            width: 40,
            margin: 5,
            borderRadius: 20,
            backgroundColor: '#f8f8f8',
        }, */









});
