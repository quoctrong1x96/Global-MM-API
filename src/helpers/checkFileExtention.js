import mime from 'mime-types';

/**
 * Check file input is Excel file
 *
 * @param {*} file File used to check
 * @returns {number} Result value is number:
 *   - 0: Is excel file.
 *   - 1: Is not excel file.
 *   - -1: File not found.
 */
const isExcel = function (file) {
  if (!file) return -1;
  const mimeType = mime.lookup(file.originalname);
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return 0;
  } else {
    return 1;
  }
};
const isExtention ={
  isExcel,
}

export default isExtention;
