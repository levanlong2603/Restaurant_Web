/**
 * Sorts an object's keys alphabetically and encodes values
 * Used for VNPAY signature generation
 * @param {Object} obj - Object to sort
 * @returns {Object} - Sorted object with encoded values
 */
function sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
}
  
module.exports = {
sortObject
};