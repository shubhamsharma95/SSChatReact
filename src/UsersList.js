import React, { Component } from 'react';
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	TextInput,
	Button,
	SafeAreaView,
	TouchableOpacity,
	Image,
	Alert
} from 'react-native';

import appStyles, { colors, appColors } from './styles/common/index.style';
import firebase from 'react-native-firebase'
import CustomImage from './cusomComponents/CustomImage'
export default class UsersList extends React.Component {
	currentUser = firebase.auth().currentUser;

	constructor(props) {
		super(props);
		this.state = { list: [], images: {} }
	}
	componentDidMount() {
		const instance = firebase.initializeApp({
			persistence: true
		});

		var usersRef = instance.database().ref("users");
		console.log(usersRef)
		usersRef.on('value', (snapshot) => {
			console.log(snapshot)
			snapshot.forEach((snap) => {

				console.log("snaps", snap);
				// console.log(snap);
				if (snap.key != this.currentUser.uid) {
					var item = snap.val();
					let image = item.dp ? item.dp : 'https://bootdey.com/img/Content/avatar/avatar6.png';
					let name = item.name ? item.name : item.email;

					var listOfUsers = this.state.list;

					listOfUsers.push({ email: item.email, userID: item.userID, image: image, name: name });
					this.setState(listOfUsers);

				}
			});
		});

	}
	onClickListener = (viewId) => {
		if (viewId == "logout") {

		} else {
			Alert.alert("Alert", "Button pressed " + viewId);
		}

	}
	openChatScreen = (object) => {
		console.log(object)
		this.props.navigation.navigate("Chat", {
			email: object.email,
			userID: object.userID

		})
	}
	goBack = () => {
		this.props.navigation.goBack();
	}

	renderItem = ({ item }) => {
		return (

			<TouchableOpacity
				activeOpacity={0.7}
				onPress={this.openChatScreen.bind(this, item)}>
				<View style={styles.row}>
					{/* <Image source={{ uri: item.image }} style={styles.pic} /> */}

					<CustomImage src={item.image} iconStyle={styles.pic} />
					<View style={styles.rowContentWrapper}>
						<View style={styles.nameContainer}>
							<Text style={styles.nameTxt} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
							<Text style={styles.mblTxt}>Mobile</Text>
						</View>
						<View style={styles.msgContainer}>
							<Text style={styles.msgTxt}>Online{/* item.status */}</Text>
						</View>
					</View>
				</View>
			</TouchableOpacity>

		);
	}
	render() {
		return (
			<SafeAreaView style={{ flex: 1 }}>
				<View style={styles.toolbarWrapper}>
					<Text style={styles.toolbarTitle}>USERS</Text>
				</View>
				<View style={styles.container}>
					<FlatList
						extraData={this.state}
						data={this.state.list}
						renderItem={this.renderItem}

					/>
				</View>
			</SafeAreaView>
		);
	}
}
const styles = StyleSheet.create({
	toolbarWrapper: {
		height: 60,
		backgroundColor: appColors.bgColor
	},

	toolbarTitle: {

		color: "#d9983d",
		fontFamily: "IntroCondLightFree",
		marginTop: 30,
		marginStart: 20,
		fontSize: 30
	},

	container: {
		backgroundColor: appColors.bgColor,
		flex: 1,
		paddingTop: 22
	},
	item: {
		padding: 10,
		fontSize: 18,
		height: 44,
	},

	buttonContainer: {
		height: 45,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		width: 250,
		borderRadius: 30,
	},

	rowContentWrapper: {
		flexDirection: "column",

		flex: 1,
	},
	row: {
		// backgroundColor: "#ddd",
		marginStart: 30,
		flexDirection: 'row',
		alignItems: 'center',
		borderColor: '#121212',
		borderBottomWidth: 1,
		paddingTop: 10,
		paddingBottom: 10,

	},
	pic: {
		marginEnd: 10,
		borderRadius: 30,
		width: 40,
		height: 40,
	},
	nameContainer: {
		flexDirection: 'row',
		// justifyContent: 'space-between',

	},
	nameTxt: {

		flex: 1,
		color: '#222',
		fontSize: 14,
		flex: 1,
		color: "#c4c4a1",

	},
	mblTxt: {
		fontWeight: '200',
		color: '#777',
		fontSize: 13,
	},
	msgContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	msgTxt: {
		fontWeight: '400',
		color: '#008B8B',
		fontSize: 12,

	},
});
