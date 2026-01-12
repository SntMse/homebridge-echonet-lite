module.exports = async (hap, accessory, el, address, eoj) => {
  // デバッグ用ログ（NASのログにEOJを表示させる）
  console.log(`[Debug] Checking device at ${address}: EOJ=[${eoj[0].toString(16)}, ${eoj[1].toString(16)}]`);

  if ((eoj[0] === 0x02 && eoj[1] === 0x90) || (eoj[0] === 0x02 && eoj[1] === 0x91)) {
    await require('./accessory-light')(hap, accessory, el, address, eoj)
    return true
  } 
  
  // 条件を緩める：もしエアコンのクラス（0x01, 0x30）だったら、迷わずエアコンとして処理
  if (eoj[0] === 0x01 && eoj[1] === 0x30) {
    await require('./accessory-aircon')(hap, accessory, el, address, eoj)
    return true
  }

  // 【力技】もしIPアドレスがエアコンのものだったら、EOJに関係なくエアコンとして処理する
  const airconIPs = ["192.168.1.139", "192.168.1.178", "192.168.1.128", "192.168.1.158"];
  if (airconIPs.includes(address)) {
    console.log(`[Debug] Force-loading Aircon for ${address}`);
    await require('./accessory-aircon')(hap, accessory, el, address, eoj)
    return true
  }

  return false
}
