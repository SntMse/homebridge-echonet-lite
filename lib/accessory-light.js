module.exports = async (hap, accessory, el, address, eoj) => {
  const service = accessory.getService(hap.Service.Lightbulb) ||
                  accessory.addService(hap.Service.Lightbulb)

  // 安全にステータスを取得するためのガード処理
  const response = await el.getPropertyValue(address, eoj, 0x80).catch(() => null);
  let status = (response && response.message && response.message.data) ? response.message.data.status : false;
  service.updateCharacteristic(hap.Characteristic.On, status)

  const updateStatus = (s) => {
    status = s
    service.updateCharacteristic(hap.Characteristic.On, status)
  }

  service.getCharacteristic(hap.Characteristic.On)
  .on('set', (value, callback) => {
    status = value
    el.setPropertyValue(address, eoj, 0x80, {status})
    callback()
  })
  .on('get', (callback) => {
    callback(null, status)
    el.getPropertyValue(address, eoj, 0x80).then((res) => {
      if (res && res.message && res.message.data)
        updateStatus(res.message.data.status)
    }).catch(() => {});
  })

  // プロパティマップの取得も安全に行う
  const propRes = await el.getPropertyMaps(address, eoj).catch(() => null);
  const properties = (propRes && propRes.message && propRes.message.data) ? propRes.message.data.set : [];

  if (properties.includes(0xB0)) {
    service.getCharacteristic(hap.Characteristic.Brightness)
    .on('set', async (value, callback) => {
      try {
        await el.setPropertyValue(address, eoj, 0xB0, {level: value})
        callback()
      } catch (err) {
        callback(err)
      }
    })
    .on('get', async (callback) => {
      if (!status) {
        callback(null, 0)
        return
      }
      try {
        const res = await el.getPropertyValue(address, eoj, 0xB0)
        if (res && res.message && res.message.data) {
          callback(null, res.message.data.level)
        } else {
          callback(null, 0)
        }
      } catch (err) {
        callback(err)
      }
    })
  }

  // Subscribe to status changes.
  el.on('notify', (res) => {
    if (!res || !res.message)
      return
    const {seoj, prop} = res.message
    if (res.device.address !== address ||
        eoj[0] !== seoj[0] || eoj[1] !== seoj[1] || eoj[2] !== seoj[2])
      return

    for (const p of prop) {
      if (!p.edt)
        continue
      if (p.epc === 0x80)  // status
        updateStatus(p.edt.status)
      else if (p.epc === 0xB0)  // level
        service.updateCharacteristic(hap.Characteristic.Brightness, p.edt.level)
    }
  })
}
