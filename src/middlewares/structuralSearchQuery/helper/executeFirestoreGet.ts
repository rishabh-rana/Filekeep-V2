import store from "../../../store";
import {
  receivedFirestoreResponseCreator,
  syncUnsubscribeListenersCreator
} from "../../../modules/app/buildStructure/actionCreator";

export const executeFirestoreGet = (
  firestoreQueries: firebase.firestore.Query[]
) => {
  firestoreQueries.forEach(query => {
    const unsubscribe = query.onSnapshot(snap => {
      snap.docChanges().forEach(change => {
        const data = change.doc.data();
        if (change.type === "removed") {
          // dispatch removal
          store.dispatch(
            receivedFirestoreResponseCreator({
              ...data,
              deletionMode: true
            })
          );
        } else {
          // dispatch data
          store.dispatch(receivedFirestoreResponseCreator(data));
        }
      });
    });
    // disptach unsubscribe listener function
    store.dispatch(syncUnsubscribeListenersCreator(unsubscribe));
  });
};
