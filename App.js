import React from "react";
import { Text, StatusBar, View, Alert, Button, Modal } from "react-native";
import codePush from "react-native-code-push";
import DummyText from "./src/DummyText";

let codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isVisible: false,
      progress: { receivedBytes: 0, totalBytes: 0 }
    };
  }
  componentDidMount() {
    codePush.disallowRestart();
    codePush.sync(
      {
        updateDialog: true,
        installMode: codePush.InstallMode.IMMEDIATE
      },
      this.codePushStatusDidChange.bind(this),
      this.codePushDownloadDidProgress.bind(this)
    );
    StatusBar.setHidden(true);
  }
  codePushStatusDidChange(syncStatus) {
    switch (syncStatus) {
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({
          syncMessage: "Downloading package.",
          isVisible: true
        });
        break;
      case codePush.SyncStatus.UPDATE_IGNORED:
        this.setState({
          syncMessage: "Update cancelled by user.",
          progress: false
        });
        Alert.alert(
          "Update Required",
          "It is mandatory to update the app",
          [
            {
              text: "Update",
              onPress: () => {
                codePush.sync(
                  {},
                  this.codePushStatusDidChange.bind(this),
                  this.codePushDownloadDidProgress.bind(this)
                );
              }
            }
          ],
          { cancelable: false }
        );
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({
          syncMessage: "Update installed and will be applied on restart.",
          progress: false
        });
        Alert.alert(
          "Restart",
          "After update your app needs to be Restarted.",
          [
            {
              text: "Restart",
              onPress: () => {
                codePush.allowRestart();
                codePush.restartApp();
              }
            }
          ],
          { cancelable: false }
        );
        break;
      case codePush.SyncStatus.UNKNOWN_ERROR:
        this.setState({
          syncMessage: "An unknown error occurred.",
          progress: false
        });
        break;
    }
  }
  codePushDownloadDidProgress(progress) {
    this.setState({ progress });
  }
  render() {
    console.disableYellowBox = true;
    <StatusBar hidden />;
    let progressView;
    if (this.state.progress) {
      progressView = (
        <Text>
          {this.state.progress.receivedBytes} of{" "}
          {this.state.progress.totalBytes} bytes received
        </Text>
      );
    }

    return (
      <View>
        <DummyText />
        <DummyText />
        <Modal
          transparent={false}
          visible={this.state.isVisible}
          onRequestClose={this.closeModal}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <View style={{ width: 300, height: 50, backgroundColor: "grey" }}>
              <Text>
                {this.state.progress.receivedBytes || 0} of{" "}
                {this.state.progress.totalBytes || 0} bytes received
              </Text>
              {this.state.progress.totalBytes !== 0 &&
                this.state.progress.receivedBytes ===
                  this.state.progress.totalBytes &&
                this.setState({ isVisible: false })}
            </View>
          </View>
        </Modal>
        {progressView}
        <Text>{this.state.syncMessage || ""}</Text>
      </View>
    );
  }
}

export default codePush(codePushOptions)(App);
