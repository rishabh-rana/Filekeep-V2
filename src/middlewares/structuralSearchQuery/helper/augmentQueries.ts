import { ParsedQueryMap, IDestructured, AugmentedQueryMap } from "../types";
import store from "../../../store";
import { IPrivateStructureObject } from "../../../modules/appTypes";

const getPrivateStructure = () => {
  return store.getState().app.appCore.private_structure;
};

export const augmentQueries = (
  queryArray: ParsedQueryMap,
  activeCompany: string
) => {
  // return map
  const augmentedQueries: AugmentedQueryMap = new Map();
  const augmentProperties: { operatedOn: string[] } = { operatedOn: [] };
  // get pvt str from state
  const private_structure = getPrivateStructure();
  if (!private_structure) return augmentedQueries;

  const recurseAugment = (query: IDestructured, primeTag: string) => {
    const newAdditions: IDestructured[] = [];
    let parentTags: string[] = query.in;
    let lastParentTag: string;
    if (parentTags) {
      lastParentTag = parentTags[parentTags.length - 1];
    } else {
      parentTags = [];
      lastParentTag = primeTag;
    }
    const lastParentTagObject = private_structure.get(
      lastParentTag
    ) as IPrivateStructureObject;

    // const newParents = lastParentTagObject.parents;

    // Object.keys(newParents).forEach(newParent => {
    //   console.log(newParent);
    //   if (newParent !== activeCompany) {
    //     // do an addition op
    //     newAdditions.push({ in: [...parentTags, newParent] });
    //   } else {
    //     // this means we have reached the company name, just add the parentTags now to final
    //     console.log("Adding here");
    //     let augmentedQRef = augmentedQueries.get(primeTag);
    //     if (augmentedQRef) {
    //       augmentedQRef.in.push(parentTags);
    //     } else {
    //       augmentedQueries.set(primeTag, {
    //         in: [parentTags]
    //       });
    //     }
    //   }
    // });
    console.log(newAdditions);
    newAdditions.forEach(query => {
      recurseAugment(query, primeTag);
    });
  };

  queryArray.forEach((query, primeTag) => {
    // [primeTag, {"in": [parentTag]}]
    recurseAugment(query, primeTag);
  });

  return augmentedQueries;
};
