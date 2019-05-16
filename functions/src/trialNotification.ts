import { sendNotification } from "./sendNotification";

exports.handler = async (snap: any, context: any) => {
  const data = snap.data();
  let receiver: string = "1";
  if (data) {
    receiver = data.uid;
  }
  console.log(receiver);
  const title = "Trial Notification";
  const description = "Hey this is a FCM";
  const sendingData = { someData: true };

  await sendNotification(receiver, title, description, sendingData);

  console.log("Exited from function onChangeNotify");
};
