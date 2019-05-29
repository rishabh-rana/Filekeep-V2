import store from "../../../store";
import {
  receivedFirestoreResponseCreator,
  syncUnsubscribeListenersCreator
} from "../../../modules/app/buildStructure/actionCreator";

export const executeFirestoreGet = (
  firestoreQueries: (firebase.firestore.CollectionReference)[]
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
              id: change.doc.id,
              deletionMode: true
            } as any)
          );
        } else {
          // dispatch data
          store.dispatch(
            receivedFirestoreResponseCreator({
              ...data,
              id: change.doc.id
            } as any)
          );
        }
      });
    });
    // disptach unsubscribe listener function
    store.dispatch(syncUnsubscribeListenersCreator(unsubscribe));
  });
};
