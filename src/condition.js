import fs from "fs";

export const isExistArrayAndNotEmpty = (array) => {
  if (array && array.length > 0) {
    return true;
  }
  return false;
};

export const unlinkSyncMultiFile = (listFile) => {
  if (isExistArrayAndNotEmpty(listFile)) {
    listFile.forEach((item) => {
      fs.unlinkSync(item.path);
    });
  }
};

export const paginationListResult = (ListResult, pageOrder, pageSize) => {
  const startIndex = (pageOrder - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return ListResult.slice(startIndex, endIndex);
};
