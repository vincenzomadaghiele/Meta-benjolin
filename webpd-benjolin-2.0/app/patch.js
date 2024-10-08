
        
                const i32 = (v) => v
                const f32 = i32
                const f64 = i32
                
function toInt(v) {
                    return v
                }
function toFloat(v) {
                    return v
                }
function createFloatArray(length) {
                    return new Float64Array(length)
                }
function setFloatDataView(dataView, position, value) {
                    dataView.setFloat64(position, value)
                }
function getFloatDataView(dataView, position) {
                    return dataView.getFloat64(position)
                }
let IT_FRAME = 0
let FRAME = 0
let BLOCK_SIZE = 0
let SAMPLE_RATE = 0
let NULL_SIGNAL = 0
let INPUT = createFloatArray(0)
let OUTPUT = createFloatArray(0)
const G_sked_ID_NULL = -1
const G_sked__ID_COUNTER_INIT = 1
const G_sked__MODE_WAIT = 0
const G_sked__MODE_SUBSCRIBE = 1


function G_sked_create(isLoggingEvents) {
                return {
                    eventLog: new Set(),
                    events: new Map(),
                    requests: new Map(),
                    idCounter: G_sked__ID_COUNTER_INIT,
                    isLoggingEvents,
                }
            }
function G_sked_wait(skeduler, event, callback) {
                if (skeduler.isLoggingEvents === false) {
                    throw new Error("Please activate skeduler's isLoggingEvents")
                }

                if (skeduler.eventLog.has(event)) {
                    callback(event)
                    return G_sked_ID_NULL
                } else {
                    return G_sked__createRequest(skeduler, event, callback, G_sked__MODE_WAIT)
                }
            }
function G_sked_waitFuture(skeduler, event, callback) {
                return G_sked__createRequest(skeduler, event, callback, G_sked__MODE_WAIT)
            }
function G_sked_subscribe(skeduler, event, callback) {
                return G_sked__createRequest(skeduler, event, callback, G_sked__MODE_SUBSCRIBE)
            }
function G_sked_emit(skeduler, event) {
                if (skeduler.isLoggingEvents === true) {
                    skeduler.eventLog.add(event)
                }
                if (skeduler.events.has(event)) {
                    const skedIds = skeduler.events.get(event)
                    const skedIdsStaying = []
                    for (let i = 0; i < skedIds.length; i++) {
                        if (skeduler.requests.has(skedIds[i])) {
                            const request = skeduler.requests.get(skedIds[i])
                            request.callback(event)
                            if (request.mode === G_sked__MODE_WAIT) {
                                skeduler.requests.delete(request.id)
                            } else {
                                skedIdsStaying.push(request.id)
                            }
                        }
                    }
                    skeduler.events.set(event, skedIdsStaying)
                }
            }
function G_sked_cancel(skeduler, id) {
                skeduler.requests.delete(id)
            }
function G_sked__createRequest(skeduler, event, callback, mode) {
                const id = G_sked__nextId(skeduler)
                const request = {
                    id, 
                    mode, 
                    callback,
                }
                skeduler.requests.set(id, request)
                if (!skeduler.events.has(event)) {
                    skeduler.events.set(event, [id])    
                } else {
                    skeduler.events.get(event).push(id)
                }
                return id
            }
function G_sked__nextId(skeduler) {
                return skeduler.idCounter++
            }
const G_commons__ARRAYS = new Map()
const G_commons__ARRAYS_SKEDULER = G_sked_create(false)
function G_commons_getArray(arrayName) {
            if (!G_commons__ARRAYS.has(arrayName)) {
                throw new Error('Unknown array ' + arrayName)
            }
            return G_commons__ARRAYS.get(arrayName)
        }
function G_commons_hasArray(arrayName) {
            return G_commons__ARRAYS.has(arrayName)
        }
function G_commons_setArray(arrayName, array) {
            G_commons__ARRAYS.set(arrayName, array)
            G_sked_emit(G_commons__ARRAYS_SKEDULER, arrayName)
        }
function G_commons_subscribeArrayChanges(arrayName, callback) {
            const id = G_sked_subscribe(G_commons__ARRAYS_SKEDULER, arrayName, callback)
            if (G_commons__ARRAYS.has(arrayName)) {
                callback(arrayName)
            }
            return id
        }
function G_commons_cancelArrayChangesSubscription(id) {
            G_sked_cancel(G_commons__ARRAYS_SKEDULER, id)
        }

const G_commons__FRAME_SKEDULER = G_sked_create(false)
function G_commons__emitFrame(frame) {
            G_sked_emit(G_commons__FRAME_SKEDULER, frame.toString())
        }
function G_commons_waitFrame(frame, callback) {
            return G_sked_waitFuture(G_commons__FRAME_SKEDULER, frame.toString(), callback)
        }
function G_commons_cancelWaitFrame(id) {
            G_sked_cancel(G_commons__FRAME_SKEDULER, id)
        }
const G_msg_FLOAT_TOKEN = "number"
const G_msg_STRING_TOKEN = "string"
function G_msg_create(template) {
                    const m = []
                    let i = 0
                    while (i < template.length) {
                        if (template[i] === G_msg_STRING_TOKEN) {
                            m.push('')
                            i += 2
                        } else if (template[i] === G_msg_FLOAT_TOKEN) {
                            m.push(0)
                            i += 1
                        }
                    }
                    return m
                }
function G_msg_getLength(message) {
                    return message.length
                }
function G_msg_getTokenType(message, tokenIndex) {
                    return typeof message[tokenIndex]
                }
function G_msg_isStringToken(message, tokenIndex) {
                    return G_msg_getTokenType(message, tokenIndex) === 'string'
                }
function G_msg_isFloatToken(message, tokenIndex) {
                    return G_msg_getTokenType(message, tokenIndex) === 'number'
                }
function G_msg_isMatching(message, tokenTypes) {
                    return (message.length === tokenTypes.length) 
                        && message.every((v, i) => G_msg_getTokenType(message, i) === tokenTypes[i])
                }
function G_msg_writeFloatToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function G_msg_writeStringToken(message, tokenIndex, value) {
                    message[tokenIndex] = value
                }
function G_msg_readFloatToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function G_msg_readStringToken(message, tokenIndex) {
                    return message[tokenIndex]
                }
function G_msg_floats(values) {
                    return values
                }
function G_msg_strings(values) {
                    return values
                }
function G_msg_display(message) {
                    return '[' + message
                        .map(t => typeof t === 'string' ? '"' + t + '"' : t.toString())
                        .join(', ') + ']'
                }
function G_msg_VOID_MESSAGE_RECEIVER(m) {}
let G_msg_EMPTY_MESSAGE = G_msg_create([])
function G_bangUtils_isBang(message) {
            return (
                G_msg_isStringToken(message, 0) 
                && G_msg_readStringToken(message, 0) === 'bang'
            )
        }
function G_bangUtils_bang() {
            const message = G_msg_create([G_msg_STRING_TOKEN, 4])
            G_msg_writeStringToken(message, 0, 'bang')
            return message
        }
function G_bangUtils_emptyToBang(message) {
            if (G_msg_getLength(message) === 0) {
                return G_bangUtils_bang()
            } else {
                return message
            }
        }
const G_msgBuses__BUSES = new Map()
function G_msgBuses_publish(busName, message) {
            let i = 0
            const callbacks = G_msgBuses__BUSES.has(busName) ? G_msgBuses__BUSES.get(busName): []
            for (i = 0; i < callbacks.length; i++) {
                callbacks[i](message)
            }
        }
function G_msgBuses_subscribe(busName, callback) {
            if (!G_msgBuses__BUSES.has(busName)) {
                G_msgBuses__BUSES.set(busName, [])
            }
            G_msgBuses__BUSES.get(busName).push(callback)
        }
function G_msgBuses_unsubscribe(busName, callback) {
            if (!G_msgBuses__BUSES.has(busName)) {
                return
            }
            const callbacks = G_msgBuses__BUSES.get(busName)
            const found = callbacks.indexOf(callback)
            if (found !== -1) {
                callbacks.splice(found, 1)
            }
        }
function computeUnitInSamples(sampleRate, amount, unit) {
        if (unit.slice(0, 3) === 'per') {
            if (amount !== 0) {
                amount = 1 / amount
            }
            unit = unit.slice(3)
        }

        if (unit === 'msec' || unit === 'milliseconds' || unit === 'millisecond') {
            return amount / 1000 * sampleRate
        } else if (unit === 'sec' || unit === 'seconds' || unit === 'second') {
            return amount * sampleRate
        } else if (unit === 'min' || unit === 'minutes' || unit === 'minute') {
            return amount * 60 * sampleRate
        } else if (unit === 'samp' || unit === 'samples' || unit === 'sample') {
            return amount
        } else {
            throw new Error("invalid time unit : " + unit)
        }
    }
const G_fs_OPERATION_SUCCESS = 0
const G_fs_OPERATION_FAILURE = 1
const G_fs__OPERATIONS_IDS = new Set()
const G_fs__OPERATIONS_CALLBACKS = new Map()
const G_fs__OPERATIONS_SOUND_CALLBACKS = new Map()
let G_fs__OPERATIONS_COUNTER = 1

function G_fs_soundInfoToMessage(soundInfo) {
                const info = G_msg_create([
                    G_msg_FLOAT_TOKEN,
                    G_msg_FLOAT_TOKEN,
                    G_msg_FLOAT_TOKEN,
                    G_msg_STRING_TOKEN,
                    soundInfo.encodingFormat.length,
                    G_msg_STRING_TOKEN,
                    soundInfo.endianness.length,
                    G_msg_STRING_TOKEN,
                    soundInfo.extraOptions.length
                ])
                G_msg_writeFloatToken(info, 0, toFloat(soundInfo.channelCount))
                G_msg_writeFloatToken(info, 1, toFloat(soundInfo.sampleRate))
                G_msg_writeFloatToken(info, 2, toFloat(soundInfo.bitDepth))
                G_msg_writeStringToken(info, 3, soundInfo.encodingFormat)
                G_msg_writeStringToken(info, 4, soundInfo.endianness)
                G_msg_writeStringToken(info, 5, soundInfo.extraOptions)
                return info
            }
function G_fs__assertOperationExists(id, operationName) {
                if (!G_fs__OPERATIONS_IDS.has(id)) {
                    throw new Error(operationName + ' operation unknown : ' + id.toString())
                }
            }
function G_fs__createOperationId() {
                const id = G_fs__OPERATIONS_COUNTER++
                G_fs__OPERATIONS_IDS.add(id)
                return id
            }
function G_soundFileOpenOpts_parse(m, soundInfo) {
            const unhandled = new Set()
            let i = 0
            while (i < G_msg_getLength(m)) {
                if (G_msg_isStringToken(m, i)) {
                    const str = G_msg_readStringToken(m, i)
                    if (['-wave', '-aiff', '-caf', '-next', '-ascii'].includes(str)) {
                        soundInfo.encodingFormat = str.slice(1)

                    } else if (str === '-raw') {
                        console.log('-raw format not yet supported')
                        i += 4
                        
                    } else if (str === '-big') {
                        soundInfo.endianness = 'b'

                    } else if (str === '-little') {
                        soundInfo.endianness = 'l'

                    } else if (str === '-bytes') {
                        if (i < G_msg_getLength(m) && G_msg_isFloatToken(m, i + 1)) {
                            soundInfo.bitDepth = toInt(G_msg_readFloatToken(m, i + 1) * 8)
                            i++
                        } else {
                            console.log('failed to parse -bytes <value>')
                        }

                    } else if (str === '-rate') {
                        if (i < G_msg_getLength(m) && G_msg_isFloatToken(m, i + 1)) {
                            soundInfo.sampleRate = toInt(G_msg_readFloatToken(m, i + 1))
                            i++
                        } else {
                            console.log('failed to parse -rate <value>')
                        }

                    } else {
                        unhandled.add(i)
                    }
                    
                } else {
                    unhandled.add(i)
                }
                i++
            }
            return unhandled
        }
function G_readWriteFsOpts_parse(m, soundInfo, unhandledOptions) {
            // Remove the "open" token
            unhandledOptions.delete(0)

            let url = ""
            let urlFound = false
            let errored = false
            let i = 1
            while (i < G_msg_getLength(m)) {
                if (!unhandledOptions.has(i)) {

                } else if (G_msg_isStringToken(m, i)) {
                    url = G_msg_readStringToken(m, i)
                    urlFound = true

                } else {
                    console.log("[writesf/readsf~] invalid option index " + i.toString())
                    errored = true
                }
                i++
            }
            if (!urlFound) {
                console.log("[writesf/readsf~] invalid options, file url not found")
                return ''
            }
            if (errored) {
                return ''
            }
            return url
        }
function G_actionUtils_isAction(message, action) {
            return G_msg_isMatching(message, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(message, 0) === action
        }

function G_buf_clear(buffer) {
            buffer.data.fill(0)
        }
function G_buf_create(length) {
            return {
                data: createFloatArray(length),
                length: length,
                writeCursor: 0,
                pullAvailableLength: 0,
            }
        }
const G_fs_SOUND_STREAM_BUFFERS = new Map()
const G_fs__SOUND_BUFFER_LENGTH = 20 * 44100
function G_fs_closeSoundStream(id, status) {
            if (!G_fs__OPERATIONS_IDS.has(id)) {
                return
            }
            G_fs__OPERATIONS_IDS.delete(id)
            G_fs__OPERATIONS_CALLBACKS.get(id)(id, status)
            G_fs__OPERATIONS_CALLBACKS.delete(id)
            // Delete this last, to give the callback 
            // a chance to save a reference to the buffer
            // If write stream, there won't be a buffer
            if (G_fs_SOUND_STREAM_BUFFERS.has(id)) {
                G_fs_SOUND_STREAM_BUFFERS.delete(id)
            }
            G_fs_i_closeSoundStream(id, status)
        }
function G_fs_x_onCloseSoundStream(id, status) {
            G_fs_closeSoundStream(id, status)
        }
function G_fs_openSoundWriteStream(url, soundInfo, callback) {
            const id = G_fs__createOperationId()
            G_fs_SOUND_STREAM_BUFFERS.set(id, [])
            G_fs__OPERATIONS_CALLBACKS.set(id, callback)
            G_fs_i_openSoundWriteStream(id, url, G_fs_soundInfoToMessage(soundInfo))
            return id
        }
function G_fs_sendSoundStreamData(id, block) {
            G_fs__assertOperationExists(id, "G_fs_sendSoundStreamData")
            G_fs_i_sendSoundStreamData(id, block)
        }
function G_tokenConversion_toFloat(m, i) {
        if (G_msg_isFloatToken(m, i)) {
            return G_msg_readFloatToken(m, i)
        } else {
            return 0
        }
    }
function G_tokenConversion_toString_(m, i) {
        if (G_msg_isStringToken(m, i)) {
            const str = G_msg_readStringToken(m, i)
            if (str === 'bang') {
                return 'symbol'
            } else {
                return str
            }
        } else {
            return 'float'
        }
    }

function G_points_interpolateLin(x, p0, p1) {
        return p0.y + (x - p0.x) * (p1.y - p0.y) / (p1.x - p0.x)
    }

function G_linesUtils_computeSlope(p0, p1) {
            return p1.x !== p0.x ? (p1.y - p0.y) / (p1.x - p0.x) : 0
        }
function G_linesUtils_removePointsBeforeFrame(points, frame) {
            const newPoints = []
            let i = 0
            while (i < points.length) {
                if (frame <= points[i].x) {
                    newPoints.push(points[i])
                }
                i++
            }
            return newPoints
        }
function G_linesUtils_insertNewLinePoints(points, p0, p1) {
            const newPoints = []
            let i = 0
            
            // Keep the points that are before the new points added
            while (i < points.length && points[i].x <= p0.x) {
                newPoints.push(points[i])
                i++
            }
            
            // Find the start value of the start point :
            
            // 1. If there is a previous point and that previous point
            // is on the same frame, we don't modify the start point value.
            // (represents a vertical line).
            if (0 < i - 1 && points[i - 1].x === p0.x) {

            // 2. If new points are inserted in between already existing points 
            // we need to interpolate the existing line to find the startValue.
            } else if (0 < i && i < points.length) {
                newPoints.push({
                    x: p0.x,
                    y: G_points_interpolateLin(p0.x, points[i - 1], points[i])
                })

            // 3. If new line is inserted after all existing points, 
            // we just take the value of the last point
            } else if (i >= points.length && points.length) {
                newPoints.push({
                    x: p0.x,
                    y: points[points.length - 1].y,
                })

            // 4. If new line placed in first position, we take the defaultStartValue.
            } else if (i === 0) {
                newPoints.push({
                    x: p0.x,
                    y: p0.y,
                })
            }
            
            newPoints.push({
                x: p1.x,
                y: p1.y,
            })
            return newPoints
        }
function G_linesUtils_computeFrameAjustedPoints(points) {
            if (points.length < 2) {
                throw new Error('invalid length for points')
            }

            const newPoints = []
            let i = 0
            let p = points[0]
            let frameLower = 0
            let frameUpper = 0
            
            while(i < points.length) {
                p = points[i]
                frameLower = Math.floor(p.x)
                frameUpper = frameLower + 1

                // I. Placing interpolated point at the lower bound of the current frame
                // ------------------------------------------------------------------------
                // 1. Point is already on an exact frame,
                if (p.x === frameLower) {
                    newPoints.push({ x: p.x, y: p.y })

                    // 1.a. if several of the next points are also on the same X,
                    // we find the last one to draw a vertical line.
                    while (
                        (i + 1) < points.length
                        && points[i + 1].x === frameLower
                    ) {
                        i++
                    }
                    if (points[i].y !== newPoints[newPoints.length - 1].y) {
                        newPoints.push({ x: points[i].x, y: points[i].y })
                    }

                    // 1.b. if last point, we quit
                    if (i + 1 >= points.length) {
                        break
                    }

                    // 1.c. if next point is in a different frame we can move on to next iteration
                    if (frameUpper <= points[i + 1].x) {
                        i++
                        continue
                    }
                
                // 2. Point isn't on an exact frame
                // 2.a. There's a previous point, the we use it to interpolate the value.
                } else if (newPoints.length) {
                    newPoints.push({
                        x: frameLower,
                        y: G_points_interpolateLin(frameLower, points[i - 1], p),
                    })
                
                // 2.b. It's the very first point, then we don't change its value.
                } else {
                    newPoints.push({ x: frameLower, y: p.y })
                }

                // II. Placing interpolated point at the upper bound of the current frame
                // ---------------------------------------------------------------------------
                // First, we find the closest point from the frame upper bound (could be the same p).
                // Or could be a point that is exactly placed on frameUpper.
                while (
                    (i + 1) < points.length 
                    && (
                        Math.ceil(points[i + 1].x) === frameUpper
                        || Math.floor(points[i + 1].x) === frameUpper
                    )
                ) {
                    i++
                }
                p = points[i]

                // 1. If the next point is directly in the next frame, 
                // we do nothing, as this corresponds with next iteration frameLower.
                if (Math.floor(p.x) === frameUpper) {
                    continue
                
                // 2. If there's still a point after p, we use it to interpolate the value
                } else if (i < points.length - 1) {
                    newPoints.push({
                        x: frameUpper,
                        y: G_points_interpolateLin(frameUpper, p, points[i + 1]),
                    })

                // 3. If it's the last point, we dont change the value
                } else {
                    newPoints.push({ x: frameUpper, y: p.y })
                }

                i++
            }

            return newPoints
        }
function G_linesUtils_computeLineSegments(points) {
            const lineSegments = []
            let i = 0
            let p0
            let p1

            while(i < points.length - 1) {
                p0 = points[i]
                p1 = points[i + 1]
                lineSegments.push({
                    p0, p1, 
                    dy: G_linesUtils_computeSlope(p0, p1),
                    dx: 1,
                })
                i++
            }
            return lineSegments
        }
const G_sigBuses__BUSES = new Map()
G_sigBuses__BUSES.set('', 0)
function G_sigBuses_addAssign(busName, value) {
            const newValue = G_sigBuses__BUSES.get(busName) + value
            G_sigBuses__BUSES.set(
                busName,
                newValue,
            )
            return newValue
        }
function G_sigBuses_set(busName, value) {
            G_sigBuses__BUSES.set(
                busName,
                value,
            )
        }
function G_sigBuses_reset(busName) {
            G_sigBuses__BUSES.set(busName, 0)
        }
function G_sigBuses_read(busName) {
            return G_sigBuses__BUSES.get(busName)
        }
function G_numbers_roundFloatAsPdInt(value) {
            return value > 0 ? Math.floor(value): Math.ceil(value)
        }
function G_funcs_mtof(value) {
        return value <= -1500 ? 0: (value > 1499 ? 3.282417553401589e+38 : Math.pow(2, (value - 69) / 12) * 440)
    }
        
function NT_hsl_setReceiveBusName(state, busName) {
            if (state.receiveBusName !== "empty") {
                G_msgBuses_unsubscribe(state.receiveBusName, state.messageReceiver)
            }
            state.receiveBusName = busName
            if (state.receiveBusName !== "empty") {
                G_msgBuses_subscribe(state.receiveBusName, state.messageReceiver)
            }
        }
function NT_hsl_setSendReceiveFromMessage(state, m) {
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'receive'
            ) {
                NT_hsl_setReceiveBusName(state, G_msg_readStringToken(m, 1))
                return true

            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'send'
            ) {
                state.sendBusName = G_msg_readStringToken(m, 1)
                return true
            }
            return false
        }
function NT_hsl_defaultMessageHandler(m) {}
function NT_hsl_receiveMessage(state, m) {
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        state.valueFloat = G_msg_readFloatToken(m, 0)
                        const outMessage = G_msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            G_msgBuses_publish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (G_bangUtils_isBang(m)) {
                        
                        const outMessage = G_msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            G_msgBuses_publish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (
                        G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN]) 
                        && G_msg_readStringToken(m, 0) === 'set'
                    ) {
                        state.valueFloat = G_msg_readFloatToken(m, 1)
                        return
                    
                    } else if (NT_hsl_setSendReceiveFromMessage(state, m) === true) {
                        return
                    }
                }





function NT_vsl_setReceiveBusName(state, busName) {
            if (state.receiveBusName !== "empty") {
                G_msgBuses_unsubscribe(state.receiveBusName, state.messageReceiver)
            }
            state.receiveBusName = busName
            if (state.receiveBusName !== "empty") {
                G_msgBuses_subscribe(state.receiveBusName, state.messageReceiver)
            }
        }
function NT_vsl_setSendReceiveFromMessage(state, m) {
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'receive'
            ) {
                NT_vsl_setReceiveBusName(state, G_msg_readStringToken(m, 1))
                return true

            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'send'
            ) {
                state.sendBusName = G_msg_readStringToken(m, 1)
                return true
            }
            return false
        }
function NT_vsl_defaultMessageHandler(m) {}
function NT_vsl_receiveMessage(state, m) {
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        state.valueFloat = G_msg_readFloatToken(m, 0)
                        const outMessage = G_msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            G_msgBuses_publish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (G_bangUtils_isBang(m)) {
                        
                        const outMessage = G_msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            G_msgBuses_publish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (
                        G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN]) 
                        && G_msg_readStringToken(m, 0) === 'set'
                    ) {
                        state.valueFloat = G_msg_readFloatToken(m, 1)
                        return
                    
                    } else if (NT_vsl_setSendReceiveFromMessage(state, m) === true) {
                        return
                    }
                }

function NT_tgl_setReceiveBusName(state, busName) {
            if (state.receiveBusName !== "empty") {
                G_msgBuses_unsubscribe(state.receiveBusName, state.messageReceiver)
            }
            state.receiveBusName = busName
            if (state.receiveBusName !== "empty") {
                G_msgBuses_subscribe(state.receiveBusName, state.messageReceiver)
            }
        }
function NT_tgl_setSendReceiveFromMessage(state, m) {
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'receive'
            ) {
                NT_tgl_setReceiveBusName(state, G_msg_readStringToken(m, 1))
                return true

            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'send'
            ) {
                state.sendBusName = G_msg_readStringToken(m, 1)
                return true
            }
            return false
        }
function NT_tgl_defaultMessageHandler(m) {}
function NT_tgl_receiveMessage(state, m) {
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        state.valueFloat = G_msg_readFloatToken(m, 0)
                        const outMessage = G_msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            G_msgBuses_publish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (G_bangUtils_isBang(m)) {
                        state.valueFloat = state.valueFloat === 0 ? state.maxValue: 0
                        const outMessage = G_msg_floats([state.valueFloat])
                        state.messageSender(outMessage)
                        if (state.sendBusName !== "empty") {
                            G_msgBuses_publish(state.sendBusName, outMessage)
                        }
                        return
        
                    } else if (
                        G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN]) 
                        && G_msg_readStringToken(m, 0) === 'set'
                    ) {
                        state.valueFloat = G_msg_readFloatToken(m, 1)
                        return
                    
                    } else if (NT_tgl_setSendReceiveFromMessage(state, m) === true) {
                        return
                    }
                }

function NT_bang_setReceiveBusName(state, busName) {
            if (state.receiveBusName !== "empty") {
                G_msgBuses_unsubscribe(state.receiveBusName, state.messageReceiver)
            }
            state.receiveBusName = busName
            if (state.receiveBusName !== "empty") {
                G_msgBuses_subscribe(state.receiveBusName, state.messageReceiver)
            }
        }
function NT_bang_setSendReceiveFromMessage(state, m) {
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'receive'
            ) {
                NT_bang_setReceiveBusName(state, G_msg_readStringToken(m, 1))
                return true

            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'send'
            ) {
                state.sendBusName = G_msg_readStringToken(m, 1)
                return true
            }
            return false
        }
function NT_bang_defaultMessageHandler(m) {}
function NT_bang_receiveMessage(state, m) {
                if (NT_bang_setSendReceiveFromMessage(state, m) === true) {
                    return
                }
                
                const outMessage = G_bangUtils_bang()
                state.messageSender(outMessage)
                if (state.sendBusName !== "empty") {
                    G_msgBuses_publish(state.sendBusName, outMessage)
                }
                return
            }

function NT_random_setMaxValue(state, maxValue) {
                state.maxValue = Math.max(maxValue, 0)
            }

function NT_delay_setDelay(state, delay) {
                state.delay = Math.max(0, delay)
            }
function NT_delay_scheduleDelay(state, callback, currentFrame) {
                if (state.scheduledBang !== G_sked_ID_NULL) {
                    NT_delay_stop(state)
                }
                state.scheduledBang = G_commons_waitFrame(toInt(
                    Math.round(
                        toFloat(currentFrame) + state.delay * state.sampleRatio)),
                    callback
                )
            }
function NT_delay_stop(state) {
                G_commons_cancelWaitFrame(state.scheduledBang)
                state.scheduledBang = G_sked_ID_NULL
            }



function NT_write_t_flushBlock(state) {
                const block = []
                for (let i = 0; i < state.block.length; i++) {
                    block.push(state.block[i].subarray(0, state.cursor))
                }
                G_fs_sendSoundStreamData(state.operationId, block)
                state.cursor = 0
            }







function NT_div_setLeft(state, value) {
                    state.leftOp = value
                }
function NT_div_setRight(state, value) {
                    state.rightOp = value
                }

function NT_mul_setLeft(state, value) {
                    state.leftOp = value
                }
function NT_mul_setRight(state, value) {
                    state.rightOp = value
                }

function NT_sub_setLeft(state, value) {
                    state.leftOp = value
                }
function NT_sub_setRight(state, value) {
                    state.rightOp = value
                }



const NT_line_t_defaultLine = {
                p0: {x: -1, y: 0},
                p1: {x: -1, y: 0},
                dx: 1,
                dy: 0,
            }
function NT_line_t_setNewLine(state, targetValue) {
                const startFrame = toFloat(FRAME)
                const endFrame = toFloat(FRAME) + state.nextDurationSamp
                if (endFrame === toFloat(FRAME)) {
                    state.currentLine = NT_line_t_defaultLine
                    state.currentValue = targetValue
                    state.nextDurationSamp = 0
                } else {
                    state.currentLine = {
                        p0: {
                            x: startFrame, 
                            y: state.currentValue,
                        }, 
                        p1: {
                            x: endFrame, 
                            y: targetValue,
                        }, 
                        dx: 1,
                        dy: 0,
                    }
                    state.currentLine.dy = G_linesUtils_computeSlope(state.currentLine.p0, state.currentLine.p1)
                    state.nextDurationSamp = 0
                }
            }
function NT_line_t_setNextDuration(state, durationMsec) {
                state.nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
            }
function NT_line_t_stop(state) {
                state.currentLine.p1.x = -1
                state.currentLine.p1.y = state.currentValue
            }

function NT_phasor_t_setStep(state, freq) {
                    state.step = (1 / SAMPLE_RATE) * freq
                }
function NT_phasor_t_setPhase(state, phase) {
                    state.phase = phase % 1.0 * 1
                }

function NT_line_setNewLine(state, targetValue) {
                state.currentLine = {
                    p0: {
                        x: toFloat(FRAME), 
                        y: state.currentValue,
                    }, 
                    p1: {
                        x: toFloat(FRAME) + state.nextDurationSamp, 
                        y: targetValue,
                    }, 
                    dx: state.grainSamp
                }
                state.nextDurationSamp = 0
                state.currentLine.dy = G_linesUtils_computeSlope(state.currentLine.p0, state.currentLine.p1) * state.grainSamp
            }
function NT_line_setNextDuration(state, durationMsec) {
                state.nextDurationSamp = computeUnitInSamples(SAMPLE_RATE, durationMsec, 'msec')
            }
function NT_line_setGrain(state, grainMsec) {
                state.grainSamp = computeUnitInSamples(SAMPLE_RATE, Math.max(grainMsec, 20), 'msec')
            }
function NT_line_stopCurrentLine(state) {
                if (state.skedId !== G_sked_ID_NULL) {
                    G_commons_cancelWaitFrame(state.skedId)
                    state.skedId = G_sked_ID_NULL
                }
                if (FRAME < state.nextSampInt) {
                    NT_line_incrementTime(state, -1 * (state.nextSamp - toFloat(FRAME)))
                }
                NT_line_setNextSamp(state, -1)
            }
function NT_line_setNextSamp(state, currentSamp) {
                state.nextSamp = currentSamp
                state.nextSampInt = toInt(Math.round(currentSamp))
            }
function NT_line_incrementTime(state, incrementSamp) {
                if (incrementSamp === state.currentLine.dx) {
                    state.currentValue += state.currentLine.dy
                } else {
                    state.currentValue += G_points_interpolateLin(
                        incrementSamp,
                        {x: 0, y: 0},
                        {x: state.currentLine.dx, y: state.currentLine.dy},
                    )
                }
                NT_line_setNextSamp(
                    state, 
                    (state.nextSamp !== -1 ? state.nextSamp: toFloat(FRAME)) + incrementSamp
                )
            }
function NT_line_tick(state) {
                state.snd0(G_msg_floats([state.currentValue]))
                if (toFloat(FRAME) >= state.currentLine.p1.x) {
                    state.currentValue = state.currentLine.p1.y
                    NT_line_stopCurrentLine(state)
                } else {
                    NT_line_incrementTime(state, state.currentLine.dx)
                    NT_line_scheduleNextTick(state)
                }
            }
function NT_line_scheduleNextTick(state) {
                state.skedId = G_commons_waitFrame(state.nextSampInt, state.tickCallback)
            }

function NT_vcf_t_updateCoefs(state) {
                let omega = state.frequency * (2.0 * Math.PI) / SAMPLE_RATE
                let oneminusr = state.Q < 0.001 ? 1.0 : Math.min(omega / state.Q, 1)
                let r = 1.0 - oneminusr
                let sigbp_qcos = (omega >= -(0.5 * Math.PI) && omega <= 0.5 * Math.PI) ? 
                    (((Math.pow(omega, 6) * (-1.0 / 720.0) + Math.pow(omega, 4) * (1.0 / 24)) - Math.pow(omega, 2) * 0.5) + 1)
                    : 0
        
                state.coef1 = 2.0 * sigbp_qcos * r
                state.coef2 = - r * r
                state.gain = 2 * oneminusr * (oneminusr + r * omega)
            }
function NT_vcf_t_setFrequency(state, frequency) {
                state.frequency = (frequency < 0.001) ? 10: frequency
                NT_vcf_t_updateCoefs(state)
            }
function NT_vcf_t_setQ(state, Q) {
                state.Q = Math.max(Q, 0)
                NT_vcf_t_updateCoefs(state)
            }



function NT_receive_t_setBusName(state, busName) {
            if (busName.length) {
                state.busName = busName
                G_sigBuses_reset(state.busName)
            }
        }





















function NT_send_t_setBusName(state, busName) {
            if (busName.length) {
                state.busName = busName
                G_sigBuses_reset(state.busName)
            }
        }

        const N_n_0_14_state = {
                                minValue: 0,
maxValue: 1,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_hsl_defaultMessageHandler,
messageSender: NT_hsl_defaultMessageHandler,
                            }
const N_m_n_0_13_1_sig_state = {
                                currentValue: 0,
                            }
const N_n_0_15_state = {
                                minValue: 0,
maxValue: 127,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "01_FRQ",
messageReceiver: NT_vsl_defaultMessageHandler,
messageSender: NT_vsl_defaultMessageHandler,
                            }
const N_n_0_16_state = {
                                minValue: 0,
maxValue: 127,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "01_RUN",
messageReceiver: NT_vsl_defaultMessageHandler,
messageSender: NT_vsl_defaultMessageHandler,
                            }
const N_n_0_17_state = {
                                minValue: 0,
maxValue: 127,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "02_FRQ",
messageReceiver: NT_vsl_defaultMessageHandler,
messageSender: NT_vsl_defaultMessageHandler,
                            }
const N_n_0_18_state = {
                                minValue: 0,
maxValue: 127,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "02_RUN",
messageReceiver: NT_vsl_defaultMessageHandler,
messageSender: NT_vsl_defaultMessageHandler,
                            }
const N_n_0_19_state = {
                                minValue: 0,
maxValue: 127,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "FIL_FRQ",
messageReceiver: NT_vsl_defaultMessageHandler,
messageSender: NT_vsl_defaultMessageHandler,
                            }
const N_n_0_20_state = {
                                minValue: 0,
maxValue: 127,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "FIL_RES",
messageReceiver: NT_vsl_defaultMessageHandler,
messageSender: NT_vsl_defaultMessageHandler,
                            }
const N_n_0_21_state = {
                                minValue: 0,
maxValue: 127,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "FIL_RUN",
messageReceiver: NT_vsl_defaultMessageHandler,
messageSender: NT_vsl_defaultMessageHandler,
                            }
const N_n_0_22_state = {
                                minValue: 0,
maxValue: 127,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "FIL_SWP",
messageReceiver: NT_vsl_defaultMessageHandler,
messageSender: NT_vsl_defaultMessageHandler,
                            }
const N_n_0_23_state = {
                                minValue: 0,
maxValue: 1,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_tgl_defaultMessageHandler,
messageSender: NT_tgl_defaultMessageHandler,
                            }
const N_n_0_24_state = {
                                value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_bang_defaultMessageHandler,
messageSender: NT_bang_defaultMessageHandler,
                            }
const N_n_0_25_state = {
                                maxValue: 127,
                            }
const N_n_0_26_state = {
                                maxValue: 127,
                            }
const N_n_0_27_state = {
                                maxValue: 127,
                            }
const N_n_0_28_state = {
                                maxValue: 127,
                            }
const N_n_0_29_state = {
                                maxValue: 127,
                            }
const N_n_0_30_state = {
                                maxValue: 127,
                            }
const N_n_0_31_state = {
                                maxValue: 127,
                            }
const N_n_0_32_state = {
                                maxValue: 127,
                            }
const N_n_0_35_state = {
                                delay: 0,
sampleRatio: 1,
scheduledBang: G_sked_ID_NULL,
                            }
const N_n_0_36_state = {
                                msgSpecs: [],
                            }
const N_n_0_33_state = {
                                operationId: -1,
isWriting: false,
block: [
                createFloatArray(220500)
            ],
cursor: 0,
                            }
const N_n_0_40_state = {
                                value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_bang_defaultMessageHandler,
messageSender: NT_bang_defaultMessageHandler,
                            }
const N_n_0_38_state = {
                                value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_bang_defaultMessageHandler,
messageSender: NT_bang_defaultMessageHandler,
                            }
const N_n_0_37_state = {
                                msgSpecs: [],
                            }
const N_n_0_34_state = {
                                msgSpecs: [],
                            }
const N_n_0_41_state = {
                                minValue: 0,
maxValue: 1,
valueFloat: 0,
value: G_msg_create([]),
receiveBusName: "empty",
sendBusName: "empty",
messageReceiver: NT_tgl_defaultMessageHandler,
messageSender: NT_tgl_defaultMessageHandler,
                            }
const N_n_1_40_state = {
                                msgSpecs: [],
                            }
const N_n_1_2_state = {
                                signalMemory: 0,
controlMemory: 0,
                            }
const N_n_1_3_state = {
                                signalMemory: 0,
controlMemory: 0,
                            }
const N_n_1_4_state = {
                                signalMemory: 0,
controlMemory: 0,
                            }
const N_n_1_5_state = {
                                signalMemory: 0,
controlMemory: 0,
                            }
const N_n_1_6_state = {
                                signalMemory: 0,
controlMemory: 0,
                            }
const N_n_1_7_state = {
                                signalMemory: 0,
controlMemory: 0,
                            }
const N_n_1_8_state = {
                                signalMemory: 0,
controlMemory: 0,
                            }
const N_n_1_9_state = {
                                signalMemory: 0,
controlMemory: 0,
                            }
const N_n_2_15_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_2_16_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_2_17_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_2_5_state = {
                                floatValues: [0,50],
stringValues: ["",""],
                            }
const N_n_2_0_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_2_12_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_2_3_state = {
                                floatValues: [0,50],
stringValues: ["",""],
                            }
const N_n_2_2_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_3_11_state = {
                                msgSpecs: [],
                            }
const N_n_3_4_state = {
                                phase: 0,
step: 0,
                            }
const N_n_5_15_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_5_16_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_5_17_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_5_5_state = {
                                floatValues: [0,50],
stringValues: ["",""],
                            }
const N_n_5_0_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_5_12_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_5_3_state = {
                                floatValues: [0,50],
stringValues: ["",""],
                            }
const N_n_5_2_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_6_11_state = {
                                msgSpecs: [],
                            }
const N_n_6_4_state = {
                                phase: 0,
step: 0,
                            }
const N_n_7_2_state = {
                                msgSpecs: [],
                            }
const N_n_7_1_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_7_4_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_7_6_state = {
                                msgSpecs: [],
                            }
const N_n_7_5_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_7_9_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_7_11_state = {
                                msgSpecs: [],
                            }
const N_n_7_10_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_7_31_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_7_32_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_7_33_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_7_19_state = {
                                msgSpecs: [],
                            }
const N_n_7_38_state = {
                                currentLine: {
                p0: {x: -1, y: 0},
                p1: {x: -1, y: 0},
                dx: 1,
                dy: 0,
            },
currentValue: 0,
nextSamp: -1,
nextSampInt: -1,
grainSamp: 0,
nextDurationSamp: 0,
skedId: G_sked_ID_NULL,
snd0: function (m) {},
tickCallback: function () {},
                            }
const N_n_7_39_state = {
                                frequency: 1,
Q: 0,
coef1: 0,
coef2: 0,
gain: 0,
y: 0,
ym1: 0,
ym2: 0,
                            }
const N_n_7_34_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_7_35_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_7_36_state = {
                                leftOp: 0,
rightOp: 0,
                            }
const N_n_7_27_state = {
                                msgSpecs: [],
                            }
const N_n_7_26_state = {
                                currentLine: NT_line_t_defaultLine,
currentValue: 0,
nextDurationSamp: 0,
                            }
const N_n_1_31_state = {
                                busName: "",
                            }
const N_n_0_6_state = {
                                busName: "",
                            }
const N_n_1_21_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_1_30_state = {
                                busName: "",
                            }
const N_n_1_29_state = {
                                busName: "",
                            }
const N_n_1_15_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_2_7_state = {
                                minValue: -60,
maxValue: 127,
                            }
const N_m_n_3_1_1_sig_state = {
                                currentValue: -1,
                            }
const N_m_n_3_2_1_sig_state = {
                                currentValue: 1,
                            }
const N_m_n_3_3_1_sig_state = {
                                currentValue: -4,
                            }
const N_m_n_3_6_1_sig_state = {
                                currentValue: 3,
                            }
const N_n_5_7_state = {
                                minValue: -60,
maxValue: 127,
                            }
const N_m_n_6_1_1_sig_state = {
                                currentValue: -1,
                            }
const N_m_n_6_2_1_sig_state = {
                                currentValue: 1,
                            }
const N_m_n_6_3_1_sig_state = {
                                currentValue: -4,
                            }
const N_m_n_6_6_1_sig_state = {
                                currentValue: 3,
                            }
const N_n_4_3_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_m_n_0_7_1_sig_state = {
                                currentValue: 0.5,
                            }
const N_m_n_7_13_1_sig_state = {
                                currentValue: 0,
                            }
const N_m_n_7_7_1_sig_state = {
                                currentValue: 127,
                            }
const N_m_n_7_12_1_sig_state = {
                                currentValue: 127,
                            }
const N_n_7_13_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_7_14_state = {
                                minValue: 0,
maxValue: 127,
                            }
const N_m_n_0_11_1_sig_state = {
                                currentValue: 10,
                            }
const N_n_0_11_state = {
                                previous: 0,
current: 0,
coeff: 0,
normal: 0,
                            }
const N_n_8_5_state = {
                                minValue: 0,
maxValue: 0.99,
                            }
const N_m_n_8_4_1_sig_state = {
                                currentValue: -1,
                            }
const N_n_8_4_state = {
                                lastOutput: 0,
lastInput: 0,
                            }
const N_m_n_0_0_1_sig_state = {
                                currentValue: 0.9,
                            }
const N_n_0_5_state = {
                                busName: "",
                            }
const N_n_1_16_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_1_10_state = {
                                minValue: 0,
maxValue: 1,
                            }
const N_n_1_36_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_1_22_state = {
                                busName: "",
                            }
const N_n_1_35_state = {
                                busName: "",
                            }
const N_n_1_23_state = {
                                busName: "",
                            }
const N_n_1_34_state = {
                                busName: "",
                            }
const N_n_1_24_state = {
                                busName: "",
                            }
const N_n_1_33_state = {
                                busName: "",
                            }
const N_n_1_25_state = {
                                busName: "",
                            }
const N_n_1_32_state = {
                                busName: "",
                            }
const N_n_1_26_state = {
                                busName: "",
                            }
const N_n_1_27_state = {
                                busName: "",
                            }
const N_n_1_28_state = {
                                busName: "",
                            }
const N_n_3_7_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_3_10_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_2_11_state = {
                                busName: "",
                            }
const N_n_6_7_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_6_10_state = {
                                floatInputs: new Map(),
stringInputs: new Map(),
outputs: new Array(1),
                            }
const N_n_5_11_state = {
                                busName: "",
                            }
        
function N_n_0_14_rcvs_0(m) {
                            
                NT_hsl_receiveMessage(N_n_0_14_state, m)
                return
            
                            throw new Error('Node "n_0_14", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_0_13_1__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                N_m_n_0_13_1_sig_rcvs_0(m)
                return
            } else {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            }
        
                            throw new Error('Node "m_n_0_13_1__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_0_13_1_sig_rcvs_0(m) {
                            
    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
        N_m_n_0_13_1_sig_state.currentValue = G_msg_readFloatToken(m, 0)
        return
    }

                            throw new Error('Node "m_n_0_13_1_sig", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_15_rcvs_0(m) {
                            
                NT_vsl_receiveMessage(N_n_0_15_state, m)
                return
            
                            throw new Error('Node "n_0_15", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_16_rcvs_0(m) {
                            
                NT_vsl_receiveMessage(N_n_0_16_state, m)
                return
            
                            throw new Error('Node "n_0_16", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_17_rcvs_0(m) {
                            
                NT_vsl_receiveMessage(N_n_0_17_state, m)
                return
            
                            throw new Error('Node "n_0_17", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_18_rcvs_0(m) {
                            
                NT_vsl_receiveMessage(N_n_0_18_state, m)
                return
            
                            throw new Error('Node "n_0_18", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_19_rcvs_0(m) {
                            
                NT_vsl_receiveMessage(N_n_0_19_state, m)
                return
            
                            throw new Error('Node "n_0_19", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_20_rcvs_0(m) {
                            
                NT_vsl_receiveMessage(N_n_0_20_state, m)
                return
            
                            throw new Error('Node "n_0_20", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_21_rcvs_0(m) {
                            
                NT_vsl_receiveMessage(N_n_0_21_state, m)
                return
            
                            throw new Error('Node "n_0_21", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_22_rcvs_0(m) {
                            
                NT_vsl_receiveMessage(N_n_0_22_state, m)
                return
            
                            throw new Error('Node "n_0_22", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_23_rcvs_0(m) {
                            
                NT_tgl_receiveMessage(N_n_0_23_state, m)
                return
            
                            throw new Error('Node "n_0_23", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_24_rcvs_0(m) {
                            
            NT_bang_receiveMessage(N_n_0_24_state, m)
            return
        
                            throw new Error('Node "n_0_24", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_25_rcvs_0(m) {
                            
            if (G_bangUtils_isBang(m)) {
                N_n_0_15_rcvs_0(G_msg_floats([Math.floor(Math.random() * N_n_0_25_state.maxValue)]))
                return
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'seed'
            ) {
                console.log('WARNING : seed not implemented yet for [random]')
                return
            }
        
                            throw new Error('Node "n_0_25", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_26_rcvs_0(m) {
                            
            if (G_bangUtils_isBang(m)) {
                N_n_0_16_rcvs_0(G_msg_floats([Math.floor(Math.random() * N_n_0_26_state.maxValue)]))
                return
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'seed'
            ) {
                console.log('WARNING : seed not implemented yet for [random]')
                return
            }
        
                            throw new Error('Node "n_0_26", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_27_rcvs_0(m) {
                            
            if (G_bangUtils_isBang(m)) {
                N_n_0_17_rcvs_0(G_msg_floats([Math.floor(Math.random() * N_n_0_27_state.maxValue)]))
                return
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'seed'
            ) {
                console.log('WARNING : seed not implemented yet for [random]')
                return
            }
        
                            throw new Error('Node "n_0_27", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_28_rcvs_0(m) {
                            
            if (G_bangUtils_isBang(m)) {
                N_n_0_18_rcvs_0(G_msg_floats([Math.floor(Math.random() * N_n_0_28_state.maxValue)]))
                return
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'seed'
            ) {
                console.log('WARNING : seed not implemented yet for [random]')
                return
            }
        
                            throw new Error('Node "n_0_28", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_29_rcvs_0(m) {
                            
            if (G_bangUtils_isBang(m)) {
                N_n_0_19_rcvs_0(G_msg_floats([Math.floor(Math.random() * N_n_0_29_state.maxValue)]))
                return
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'seed'
            ) {
                console.log('WARNING : seed not implemented yet for [random]')
                return
            }
        
                            throw new Error('Node "n_0_29", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_30_rcvs_0(m) {
                            
            if (G_bangUtils_isBang(m)) {
                N_n_0_20_rcvs_0(G_msg_floats([Math.floor(Math.random() * N_n_0_30_state.maxValue)]))
                return
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'seed'
            ) {
                console.log('WARNING : seed not implemented yet for [random]')
                return
            }
        
                            throw new Error('Node "n_0_30", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_31_rcvs_0(m) {
                            
            if (G_bangUtils_isBang(m)) {
                N_n_0_21_rcvs_0(G_msg_floats([Math.floor(Math.random() * N_n_0_31_state.maxValue)]))
                return
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'seed'
            ) {
                console.log('WARNING : seed not implemented yet for [random]')
                return
            }
        
                            throw new Error('Node "n_0_31", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_32_rcvs_0(m) {
                            
            if (G_bangUtils_isBang(m)) {
                N_n_0_22_rcvs_0(G_msg_floats([Math.floor(Math.random() * N_n_0_32_state.maxValue)]))
                return
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'seed'
            ) {
                console.log('WARNING : seed not implemented yet for [random]')
                return
            }
        
                            throw new Error('Node "n_0_32", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_35_rcvs_0(m) {
                            
            if (G_msg_getLength(m) === 1) {
                if (G_msg_isStringToken(m, 0)) {
                    const action = G_msg_readStringToken(m, 0)
                    if (action === 'bang' || action === 'start') {
                        NT_delay_scheduleDelay(
                            N_n_0_35_state, 
                            () => N_n_0_35_snds_0(G_bangUtils_bang()),
                            FRAME,
                        )
                        return
                    } else if (action === 'stop') {
                        NT_delay_stop(N_n_0_35_state)
                        return
                    }
                    
                } else if (G_msg_isFloatToken(m, 0)) {
                    NT_delay_setDelay(N_n_0_35_state, G_msg_readFloatToken(m, 0))
                    NT_delay_scheduleDelay(
                        N_n_0_35_state,
                        () => N_n_0_35_snds_0(G_bangUtils_bang()),
                        FRAME,
                    )
                    return 
                }
            
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN, G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'tempo'
            ) {
                N_n_0_35_state.sampleRatio = computeUnitInSamples(
                    SAMPLE_RATE, 
                    G_msg_readFloatToken(m, 1), 
                    G_msg_readStringToken(m, 2)
                )
                return
            }
        
                            throw new Error('Node "n_0_35", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_36_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_36_state.msgSpecs.splice(0, N_n_0_36_state.msgSpecs.length - 1)
                    N_n_0_36_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_36_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_36_state.msgSpecs.length; i++) {
                        if (N_n_0_36_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_36_state.msgSpecs[i].send, N_n_0_36_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_m_n_0_33_0__routemsg_rcvs_0(N_n_0_36_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_36", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_0_33_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_0_33_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_0_33_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_33_rcvs_0_message(m) {
                            
            if (G_msg_getLength(m) >= 2) {
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'open'
                ) {
                    if (N_n_0_33_state.operationId !== -1) {
                        G_fs_closeSoundStream(N_n_0_33_state.operationId, G_fs_OPERATION_SUCCESS)
                    }
    
                    const soundInfo = {
                        channelCount: 1,
                        sampleRate: toInt(SAMPLE_RATE),
                        bitDepth: 32,
                        encodingFormat: '',
                        endianness: '',
                        extraOptions: '',
                    }
                    const unhandledOptions = G_soundFileOpenOpts_parse(
                        m,
                        soundInfo,
                    )
                    const url = G_readWriteFsOpts_parse(
                        m,
                        soundInfo,
                        unhandledOptions
                    )
                    if (url.length === 0) {
                        return
                    }
                    N_n_0_33_state.operationId = G_fs_openSoundWriteStream(
                        url,
                        soundInfo,
                        () => {
                            NT_write_t_flushBlock(N_n_0_33_state)
                            N_n_0_33_state.operationId = -1
                        }
                    )
                    return
                }
    
            } else if (G_actionUtils_isAction(m, 'start')) {
                    N_n_0_33_state.isWriting = true
                    return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_write_t_flushBlock(N_n_0_33_state)
                N_n_0_33_state.isWriting = false
                return
    
            } else if (G_actionUtils_isAction(m, 'print')) {
                console.log('[writesf~] writing = ' + N_n_0_33_state.isWriting.toString())
                return
            }    
        
                            throw new Error('Node "n_0_33", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_40_rcvs_0(m) {
                            
            NT_bang_receiveMessage(N_n_0_40_state, m)
            return
        
                            throw new Error('Node "n_0_40", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_38_rcvs_0(m) {
                            
            NT_bang_receiveMessage(N_n_0_38_state, m)
            return
        
                            throw new Error('Node "n_0_38", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_39_rcvs_0(m) {
                            
            N_n_0_34_rcvs_0(G_bangUtils_bang())
N_n_0_37_rcvs_0(G_bangUtils_bang())
N_n_0_35_rcvs_0(G_bangUtils_bang())
            return
        
                            throw new Error('Node "n_0_39", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_37_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_37_state.msgSpecs.splice(0, N_n_0_37_state.msgSpecs.length - 1)
                    N_n_0_37_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_37_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_37_state.msgSpecs.length; i++) {
                        if (N_n_0_37_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_37_state.msgSpecs[i].send, N_n_0_37_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_m_n_0_33_0__routemsg_rcvs_0(N_n_0_37_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_37", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_34_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_0_34_state.msgSpecs.splice(0, N_n_0_34_state.msgSpecs.length - 1)
                    N_n_0_34_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_0_34_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_0_34_state.msgSpecs.length; i++) {
                        if (N_n_0_34_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_0_34_state.msgSpecs[i].send, N_n_0_34_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_m_n_0_33_0__routemsg_rcvs_0(N_n_0_34_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_0_34", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_0_41_rcvs_0(m) {
                            
                NT_tgl_receiveMessage(N_n_0_41_state, m)
                return
            
                            throw new Error('Node "n_0_41", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_1_40_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_1_40_state.msgSpecs.splice(0, N_n_1_40_state.msgSpecs.length - 1)
                    N_n_1_40_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_1_40_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_1_40_state.msgSpecs.length; i++) {
                        if (N_n_1_40_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_1_40_state.msgSpecs[i].send, N_n_1_40_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_1_40_snds_0(N_n_1_40_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_1_40", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_1_2_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_1_2_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_1_2_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_1_2_outs_0 = 0
function N_n_1_2_rcvs_0_message(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                N_n_1_2_state.signalMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_2_state.controlMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_2_state.controlMemory = 1e20
                return
            }
        
                            throw new Error('Node "n_1_2", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_1_3_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_1_3_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_1_3_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_1_3_outs_0 = 0
function N_n_1_3_rcvs_0_message(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                N_n_1_3_state.signalMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_3_state.controlMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_3_state.controlMemory = 1e20
                return
            }
        
                            throw new Error('Node "n_1_3", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_1_4_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_1_4_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_1_4_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_1_4_outs_0 = 0
function N_n_1_4_rcvs_0_message(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                N_n_1_4_state.signalMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_4_state.controlMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_4_state.controlMemory = 1e20
                return
            }
        
                            throw new Error('Node "n_1_4", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_1_5_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_1_5_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_1_5_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_1_5_outs_0 = 0
function N_n_1_5_rcvs_0_message(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                N_n_1_5_state.signalMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_5_state.controlMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_5_state.controlMemory = 1e20
                return
            }
        
                            throw new Error('Node "n_1_5", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_1_6_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_1_6_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_1_6_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_1_6_outs_0 = 0
function N_n_1_6_rcvs_0_message(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                N_n_1_6_state.signalMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_6_state.controlMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_6_state.controlMemory = 1e20
                return
            }
        
                            throw new Error('Node "n_1_6", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_1_7_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_1_7_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_1_7_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_1_7_outs_0 = 0
function N_n_1_7_rcvs_0_message(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                N_n_1_7_state.signalMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_7_state.controlMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_7_state.controlMemory = 1e20
                return
            }
        
                            throw new Error('Node "n_1_7", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_1_8_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_1_8_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_1_8_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_1_8_outs_0 = 0
function N_n_1_8_rcvs_0_message(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                N_n_1_8_state.signalMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_8_state.controlMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_8_state.controlMemory = 1e20
                return
            }
        
                            throw new Error('Node "n_1_8", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }

function N_m_n_1_9_0__routemsg_rcvs_0(m) {
                            
            if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                G_msg_VOID_MESSAGE_RECEIVER(m)
                return
            } else {
                N_n_1_9_rcvs_0_message(m)
                return
            }
        
                            throw new Error('Node "m_n_1_9_0__routemsg", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_1_9_outs_0 = 0
function N_n_1_9_rcvs_0_message(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                N_n_1_9_state.signalMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_9_state.controlMemory = G_msg_readFloatToken(m, 1)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN])
                && G_msg_readStringToken(m, 0) === 'reset'
            ) {
                N_n_1_9_state.controlMemory = 1e20
                return
            }
        
                            throw new Error('Node "n_1_9", inlet "0_message", unsupported message : ' + G_msg_display(m))
                        }



function N_n_2_15_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_div_setLeft(N_n_2_15_state, G_msg_readFloatToken(m, 0))
                        N_n_2_16_rcvs_0(G_msg_floats([N_n_2_15_state.rightOp !== 0 ? N_n_2_15_state.leftOp / N_n_2_15_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_2_16_rcvs_0(G_msg_floats([N_n_2_15_state.rightOp !== 0 ? N_n_2_15_state.leftOp / N_n_2_15_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_2_15", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_2_16_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_mul_setLeft(N_n_2_16_state, G_msg_readFloatToken(m, 0))
                        N_n_2_17_rcvs_0(G_msg_floats([N_n_2_16_state.leftOp * N_n_2_16_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_2_17_rcvs_0(G_msg_floats([N_n_2_16_state.leftOp * N_n_2_16_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_2_16", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_2_17_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_sub_setLeft(N_n_2_17_state, G_msg_readFloatToken(m, 0))
                        N_n_2_5_rcvs_0(G_msg_floats([N_n_2_17_state.leftOp - N_n_2_17_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_2_5_rcvs_0(G_msg_floats([N_n_2_17_state.leftOp - N_n_2_17_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_2_17", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_2_5_rcvs_0(m) {
                            
            if (!G_bangUtils_isBang(m)) {
                for (let i = 0; i < G_msg_getLength(m); i++) {
                    N_n_2_5_state.stringValues[i] = G_tokenConversion_toString_(m, i)
                    N_n_2_5_state.floatValues[i] = G_tokenConversion_toFloat(m, i)
                }
            }
    
            const template = [G_msg_FLOAT_TOKEN,G_msg_FLOAT_TOKEN]
    
            const messageOut = G_msg_create(template)
    
            G_msg_writeFloatToken(messageOut, 0, N_n_2_5_state.floatValues[0])
G_msg_writeFloatToken(messageOut, 1, N_n_2_5_state.floatValues[1])
    
            N_n_2_0_rcvs_0(messageOut)
            return
        
                            throw new Error('Node "n_2_5", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_2_0_outs_0 = 0
function N_n_2_0_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_2_0_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_2_0_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_2_0_state)
                return
    
            }
        
                            throw new Error('Node "n_2_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_2_12_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_div_setLeft(N_n_2_12_state, G_msg_readFloatToken(m, 0))
                        N_n_2_3_rcvs_0(G_msg_floats([N_n_2_12_state.rightOp !== 0 ? N_n_2_12_state.leftOp / N_n_2_12_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_2_3_rcvs_0(G_msg_floats([N_n_2_12_state.rightOp !== 0 ? N_n_2_12_state.leftOp / N_n_2_12_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_2_12", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_2_3_rcvs_0(m) {
                            
            if (!G_bangUtils_isBang(m)) {
                for (let i = 0; i < G_msg_getLength(m); i++) {
                    N_n_2_3_state.stringValues[i] = G_tokenConversion_toString_(m, i)
                    N_n_2_3_state.floatValues[i] = G_tokenConversion_toFloat(m, i)
                }
            }
    
            const template = [G_msg_FLOAT_TOKEN,G_msg_FLOAT_TOKEN]
    
            const messageOut = G_msg_create(template)
    
            G_msg_writeFloatToken(messageOut, 0, N_n_2_3_state.floatValues[0])
G_msg_writeFloatToken(messageOut, 1, N_n_2_3_state.floatValues[1])
    
            N_n_2_2_rcvs_0(messageOut)
            return
        
                            throw new Error('Node "n_2_3", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_2_2_outs_0 = 0
function N_n_2_2_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_2_2_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_2_2_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_2_2_state)
                return
    
            }
        
                            throw new Error('Node "n_2_2", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_3_11_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_3_11_state.msgSpecs.splice(0, N_n_3_11_state.msgSpecs.length - 1)
                    N_n_3_11_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_3_11_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_3_11_state.msgSpecs.length; i++) {
                        if (N_n_3_11_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_3_11_state.msgSpecs[i].send, N_n_3_11_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_3_4_rcvs_1(N_n_3_11_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_3_11", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_3_4_outs_0 = 0
function N_n_3_4_rcvs_1(m) {
                            
    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
        NT_phasor_t_setPhase(N_n_3_4_state, G_msg_readFloatToken(m, 0))
        return
    }

                            throw new Error('Node "n_3_4", inlet "1", unsupported message : ' + G_msg_display(m))
                        }



function N_n_5_15_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_div_setLeft(N_n_5_15_state, G_msg_readFloatToken(m, 0))
                        N_n_5_16_rcvs_0(G_msg_floats([N_n_5_15_state.rightOp !== 0 ? N_n_5_15_state.leftOp / N_n_5_15_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_5_16_rcvs_0(G_msg_floats([N_n_5_15_state.rightOp !== 0 ? N_n_5_15_state.leftOp / N_n_5_15_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_5_15", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_5_16_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_mul_setLeft(N_n_5_16_state, G_msg_readFloatToken(m, 0))
                        N_n_5_17_rcvs_0(G_msg_floats([N_n_5_16_state.leftOp * N_n_5_16_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_5_17_rcvs_0(G_msg_floats([N_n_5_16_state.leftOp * N_n_5_16_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_5_16", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_5_17_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_sub_setLeft(N_n_5_17_state, G_msg_readFloatToken(m, 0))
                        N_n_5_5_rcvs_0(G_msg_floats([N_n_5_17_state.leftOp - N_n_5_17_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_5_5_rcvs_0(G_msg_floats([N_n_5_17_state.leftOp - N_n_5_17_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_5_17", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_5_5_rcvs_0(m) {
                            
            if (!G_bangUtils_isBang(m)) {
                for (let i = 0; i < G_msg_getLength(m); i++) {
                    N_n_5_5_state.stringValues[i] = G_tokenConversion_toString_(m, i)
                    N_n_5_5_state.floatValues[i] = G_tokenConversion_toFloat(m, i)
                }
            }
    
            const template = [G_msg_FLOAT_TOKEN,G_msg_FLOAT_TOKEN]
    
            const messageOut = G_msg_create(template)
    
            G_msg_writeFloatToken(messageOut, 0, N_n_5_5_state.floatValues[0])
G_msg_writeFloatToken(messageOut, 1, N_n_5_5_state.floatValues[1])
    
            N_n_5_0_rcvs_0(messageOut)
            return
        
                            throw new Error('Node "n_5_5", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_5_0_outs_0 = 0
function N_n_5_0_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_5_0_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_5_0_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_5_0_state)
                return
    
            }
        
                            throw new Error('Node "n_5_0", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_5_12_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_div_setLeft(N_n_5_12_state, G_msg_readFloatToken(m, 0))
                        N_n_5_3_rcvs_0(G_msg_floats([N_n_5_12_state.rightOp !== 0 ? N_n_5_12_state.leftOp / N_n_5_12_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_5_3_rcvs_0(G_msg_floats([N_n_5_12_state.rightOp !== 0 ? N_n_5_12_state.leftOp / N_n_5_12_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_5_12", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_5_3_rcvs_0(m) {
                            
            if (!G_bangUtils_isBang(m)) {
                for (let i = 0; i < G_msg_getLength(m); i++) {
                    N_n_5_3_state.stringValues[i] = G_tokenConversion_toString_(m, i)
                    N_n_5_3_state.floatValues[i] = G_tokenConversion_toFloat(m, i)
                }
            }
    
            const template = [G_msg_FLOAT_TOKEN,G_msg_FLOAT_TOKEN]
    
            const messageOut = G_msg_create(template)
    
            G_msg_writeFloatToken(messageOut, 0, N_n_5_3_state.floatValues[0])
G_msg_writeFloatToken(messageOut, 1, N_n_5_3_state.floatValues[1])
    
            N_n_5_2_rcvs_0(messageOut)
            return
        
                            throw new Error('Node "n_5_3", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_5_2_outs_0 = 0
function N_n_5_2_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_5_2_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_5_2_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_5_2_state)
                return
    
            }
        
                            throw new Error('Node "n_5_2", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_6_11_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_6_11_state.msgSpecs.splice(0, N_n_6_11_state.msgSpecs.length - 1)
                    N_n_6_11_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_6_11_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_6_11_state.msgSpecs.length; i++) {
                        if (N_n_6_11_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_6_11_state.msgSpecs[i].send, N_n_6_11_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_6_4_rcvs_1(N_n_6_11_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_6_11", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_6_4_outs_0 = 0
function N_n_6_4_rcvs_1(m) {
                            
    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
        NT_phasor_t_setPhase(N_n_6_4_state, G_msg_readFloatToken(m, 0))
        return
    }

                            throw new Error('Node "n_6_4", inlet "1", unsupported message : ' + G_msg_display(m))
                        }



function N_n_7_2_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_7_2_state.msgSpecs.splice(0, N_n_7_2_state.msgSpecs.length - 1)
                    N_n_7_2_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_7_2_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_7_2_state.msgSpecs.length; i++) {
                        if (N_n_7_2_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_7_2_state.msgSpecs[i].send, N_n_7_2_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_7_1_rcvs_0(N_n_7_2_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_7_2", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_7_1_outs_0 = 0
function N_n_7_1_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_7_1_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_7_1_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_7_1_state)
                return
    
            }
        
                            throw new Error('Node "n_7_1", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_7_4_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_div_setLeft(N_n_7_4_state, G_msg_readFloatToken(m, 0))
                        N_n_7_6_rcvs_0(G_msg_floats([N_n_7_4_state.rightOp !== 0 ? N_n_7_4_state.leftOp / N_n_7_4_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_7_6_rcvs_0(G_msg_floats([N_n_7_4_state.rightOp !== 0 ? N_n_7_4_state.leftOp / N_n_7_4_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_7_4", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_6_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_7_6_state.msgSpecs.splice(0, N_n_7_6_state.msgSpecs.length - 1)
                    N_n_7_6_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_7_6_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_7_6_state.msgSpecs.length; i++) {
                        if (N_n_7_6_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_7_6_state.msgSpecs[i].send, N_n_7_6_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_7_5_rcvs_0(N_n_7_6_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_7_6", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_7_5_outs_0 = 0
function N_n_7_5_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_7_5_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_7_5_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_7_5_state)
                return
    
            }
        
                            throw new Error('Node "n_7_5", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_7_9_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_div_setLeft(N_n_7_9_state, G_msg_readFloatToken(m, 0))
                        N_n_7_11_rcvs_0(G_msg_floats([N_n_7_9_state.rightOp !== 0 ? N_n_7_9_state.leftOp / N_n_7_9_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_7_11_rcvs_0(G_msg_floats([N_n_7_9_state.rightOp !== 0 ? N_n_7_9_state.leftOp / N_n_7_9_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_7_9", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_11_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_7_11_state.msgSpecs.splice(0, N_n_7_11_state.msgSpecs.length - 1)
                    N_n_7_11_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_7_11_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_7_11_state.msgSpecs.length; i++) {
                        if (N_n_7_11_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_7_11_state.msgSpecs[i].send, N_n_7_11_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_7_10_rcvs_0(N_n_7_11_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_7_11", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_7_10_outs_0 = 0
function N_n_7_10_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_7_10_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_7_10_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_7_10_state)
                return
    
            }
        
                            throw new Error('Node "n_7_10", inlet "0", unsupported message : ' + G_msg_display(m))
                        }



function N_n_7_31_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_div_setLeft(N_n_7_31_state, G_msg_readFloatToken(m, 0))
                        N_n_7_32_rcvs_0(G_msg_floats([N_n_7_31_state.rightOp !== 0 ? N_n_7_31_state.leftOp / N_n_7_31_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_7_32_rcvs_0(G_msg_floats([N_n_7_31_state.rightOp !== 0 ? N_n_7_31_state.leftOp / N_n_7_31_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_7_31", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_32_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_mul_setLeft(N_n_7_32_state, G_msg_readFloatToken(m, 0))
                        N_n_7_33_rcvs_0(G_msg_floats([N_n_7_32_state.leftOp * N_n_7_32_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_7_33_rcvs_0(G_msg_floats([N_n_7_32_state.leftOp * N_n_7_32_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_7_32", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_33_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_sub_setLeft(N_n_7_33_state, G_msg_readFloatToken(m, 0))
                        N_n_7_19_rcvs_0(G_msg_floats([N_n_7_33_state.leftOp - N_n_7_33_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_7_19_rcvs_0(G_msg_floats([N_n_7_33_state.leftOp - N_n_7_33_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_7_33", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_19_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_7_19_state.msgSpecs.splice(0, N_n_7_19_state.msgSpecs.length - 1)
                    N_n_7_19_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_7_19_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_7_19_state.msgSpecs.length; i++) {
                        if (N_n_7_19_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_7_19_state.msgSpecs[i].send, N_n_7_19_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_7_38_rcvs_0(N_n_7_19_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_7_19", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_38_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                NT_line_stopCurrentLine(N_n_7_38_state)
                switch (G_msg_getLength(m)) {
                    case 3:
                        NT_line_setGrain(N_n_7_38_state, G_msg_readFloatToken(m, 2))
                    case 2:
                        NT_line_setNextDuration(N_n_7_38_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        const targetValue = G_msg_readFloatToken(m, 0)
                        if (N_n_7_38_state.nextDurationSamp === 0) {
                            N_n_7_38_state.currentValue = targetValue
                            N_n_7_39_rcvs_2(G_msg_floats([targetValue]))
                        } else {
                            N_n_7_39_rcvs_2(G_msg_floats([N_n_7_38_state.currentValue]))
                            NT_line_setNewLine(N_n_7_38_state, targetValue)
                            NT_line_incrementTime(N_n_7_38_state, N_n_7_38_state.currentLine.dx)
                            NT_line_scheduleNextTick(N_n_7_38_state)
                        }
                        
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_stopCurrentLine(N_n_7_38_state)
                return
    
            } else if (
                G_msg_isMatching(m, [G_msg_STRING_TOKEN, G_msg_FLOAT_TOKEN])
                && G_msg_readStringToken(m, 0) === 'set'
            ) {
                NT_line_stopCurrentLine(N_n_7_38_state)
                N_n_7_38_state.currentValue = G_msg_readFloatToken(m, 1)
                return
            }
        
                            throw new Error('Node "n_7_38", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_7_39_outs_0 = 0
let N_n_7_39_outs_1 = 0
function N_n_7_39_rcvs_2(m) {
                            
    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
        NT_vcf_t_setQ(N_n_7_39_state, G_msg_readFloatToken(m, 0))
        return
    }

                            throw new Error('Node "n_7_39", inlet "2", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_34_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_div_setLeft(N_n_7_34_state, G_msg_readFloatToken(m, 0))
                        N_n_7_35_rcvs_0(G_msg_floats([N_n_7_34_state.rightOp !== 0 ? N_n_7_34_state.leftOp / N_n_7_34_state.rightOp: 0]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_7_35_rcvs_0(G_msg_floats([N_n_7_34_state.rightOp !== 0 ? N_n_7_34_state.leftOp / N_n_7_34_state.rightOp: 0]))
                        return
                    }
                
                            throw new Error('Node "n_7_34", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_35_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_mul_setLeft(N_n_7_35_state, G_msg_readFloatToken(m, 0))
                        N_n_7_36_rcvs_0(G_msg_floats([N_n_7_35_state.leftOp * N_n_7_35_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_7_36_rcvs_0(G_msg_floats([N_n_7_35_state.leftOp * N_n_7_35_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_7_35", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_36_rcvs_0(m) {
                            
                    if (G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])) {
                        NT_sub_setLeft(N_n_7_36_state, G_msg_readFloatToken(m, 0))
                        N_n_7_27_rcvs_0(G_msg_floats([N_n_7_36_state.leftOp - N_n_7_36_state.rightOp]))
                        return
                    
                    } else if (G_bangUtils_isBang(m)) {
                        N_n_7_27_rcvs_0(G_msg_floats([N_n_7_36_state.leftOp - N_n_7_36_state.rightOp]))
                        return
                    }
                
                            throw new Error('Node "n_7_36", inlet "0", unsupported message : ' + G_msg_display(m))
                        }

function N_n_7_27_rcvs_0(m) {
                            
                if (
                    G_msg_isStringToken(m, 0) 
                    && G_msg_readStringToken(m, 0) === 'set'
                ) {
                    const outTemplate = []
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            outTemplate.push(G_msg_FLOAT_TOKEN)
                        } else {
                            outTemplate.push(G_msg_STRING_TOKEN)
                            outTemplate.push(G_msg_readStringToken(m, i).length)
                        }
                    }

                    const outMessage = G_msg_create(outTemplate)
                    for (let i = 1; i < G_msg_getLength(m); i++) {
                        if (G_msg_isFloatToken(m, i)) {
                            G_msg_writeFloatToken(
                                outMessage, i - 1, G_msg_readFloatToken(m, i)
                            )
                        } else {
                            G_msg_writeStringToken(
                                outMessage, i - 1, G_msg_readStringToken(m, i)
                            )
                        }
                    }

                    N_n_7_27_state.msgSpecs.splice(0, N_n_7_27_state.msgSpecs.length - 1)
                    N_n_7_27_state.msgSpecs[0] = {
                        transferFunction: function (m) {
                            return N_n_7_27_state.msgSpecs[0].outMessage
                        },
                        outTemplate: outTemplate,
                        outMessage: outMessage,
                        send: "",
                        hasSend: false,
                    }
                    return
    
                } else {
                    for (let i = 0; i < N_n_7_27_state.msgSpecs.length; i++) {
                        if (N_n_7_27_state.msgSpecs[i].hasSend) {
                            G_msgBuses_publish(N_n_7_27_state.msgSpecs[i].send, N_n_7_27_state.msgSpecs[i].transferFunction(m))
                        } else {
                            N_n_7_26_rcvs_0(N_n_7_27_state.msgSpecs[i].transferFunction(m))
                        }
                    }
                    return
                }
            
                            throw new Error('Node "n_7_27", inlet "0", unsupported message : ' + G_msg_display(m))
                        }
let N_n_7_26_outs_0 = 0
function N_n_7_26_rcvs_0(m) {
                            
            if (
                G_msg_isMatching(m, [G_msg_FLOAT_TOKEN])
                || G_msg_isMatching(m, [G_msg_FLOAT_TOKEN, G_msg_FLOAT_TOKEN])
            ) {
                switch (G_msg_getLength(m)) {
                    case 2:
                        NT_line_t_setNextDuration(N_n_7_26_state, G_msg_readFloatToken(m, 1))
                    case 1:
                        NT_line_t_setNewLine(N_n_7_26_state, G_msg_readFloatToken(m, 0))
                }
                return
    
            } else if (G_actionUtils_isAction(m, 'stop')) {
                NT_line_t_stop(N_n_7_26_state)
                return
    
            }
        
                            throw new Error('Node "n_7_26", inlet "0", unsupported message : ' + G_msg_display(m))
                        }






































let N_n_1_21_outs_0 = 0





let N_n_1_15_outs_0 = 0



















































let N_n_6_6_outs_0 = 0

let N_n_4_3_outs_0 = 0







let N_m_n_7_13_1_sig_outs_0 = 0













let N_n_7_13_outs_0 = 0







let N_m_n_0_11_1_sig_outs_0 = 0

let N_n_0_11_outs_0 = 0



let N_m_n_8_4_1_sig_outs_0 = 0

let N_n_8_4_outs_0 = 0







let N_n_0_0_outs_0 = 0

let N_n_0_13_outs_0 = 0





let N_n_1_16_outs_0 = 0



let N_n_1_36_outs_0 = 0























let N_n_3_7_outs_0 = 0

let N_n_3_10_outs_0 = 0



let N_n_6_7_outs_0 = 0

let N_n_6_10_outs_0 = 0



function N_n_0_24_snds_0(m) {
                        N_n_0_25_rcvs_0(m)
N_n_0_26_rcvs_0(m)
N_n_0_27_rcvs_0(m)
N_n_0_28_rcvs_0(m)
N_n_0_29_rcvs_0(m)
N_n_0_30_rcvs_0(m)
N_n_0_31_rcvs_0(m)
N_n_0_32_rcvs_0(m)
                    }
function N_n_0_35_snds_0(m) {
                        N_n_0_36_rcvs_0(m)
N_n_0_40_rcvs_0(m)
                    }
function N_n_1_40_snds_0(m) {
                        N_m_n_1_2_0__routemsg_rcvs_0(m)
N_m_n_1_3_0__routemsg_rcvs_0(m)
N_m_n_1_4_0__routemsg_rcvs_0(m)
N_m_n_1_5_0__routemsg_rcvs_0(m)
N_m_n_1_6_0__routemsg_rcvs_0(m)
N_m_n_1_7_0__routemsg_rcvs_0(m)
N_m_n_1_8_0__routemsg_rcvs_0(m)
N_m_n_1_9_0__routemsg_rcvs_0(m)
                    }
function N_n_7_25_snds_0(m) {
                        N_n_7_31_rcvs_0(m)
N_n_7_34_rcvs_0(m)
                    }

        function COLD_0(m) {
                    N_m_n_7_13_1_sig_outs_0 = N_m_n_7_13_1_sig_state.currentValue
                    
                }
function COLD_1(m) {
                    N_m_n_0_11_1_sig_outs_0 = N_m_n_0_11_1_sig_state.currentValue
                    
                N_n_0_11_state.coeff = Math.min(Math.max(1 - N_m_n_0_11_1_sig_outs_0 * (2 * Math.PI) / SAMPLE_RATE, 0), 1)
                N_n_0_11_state.normal = 0.5 * (1 + N_n_0_11_state.coeff)
            
                }
function COLD_2(m) {
                    N_m_n_8_4_1_sig_outs_0 = N_m_n_8_4_1_sig_state.currentValue
                    
                }
        function IO_rcv_n_0_14_0(m) {
                    N_n_0_14_rcvs_0(m)
                }
function IO_rcv_n_0_15_0(m) {
                    N_n_0_15_rcvs_0(m)
                }
function IO_rcv_n_0_16_0(m) {
                    N_n_0_16_rcvs_0(m)
                }
function IO_rcv_n_0_17_0(m) {
                    N_n_0_17_rcvs_0(m)
                }
function IO_rcv_n_0_18_0(m) {
                    N_n_0_18_rcvs_0(m)
                }
function IO_rcv_n_0_19_0(m) {
                    N_n_0_19_rcvs_0(m)
                }
function IO_rcv_n_0_20_0(m) {
                    N_n_0_20_rcvs_0(m)
                }
function IO_rcv_n_0_21_0(m) {
                    N_n_0_21_rcvs_0(m)
                }
function IO_rcv_n_0_22_0(m) {
                    N_n_0_22_rcvs_0(m)
                }
function IO_rcv_n_0_23_0(m) {
                    N_n_0_23_rcvs_0(m)
                }
function IO_rcv_n_0_24_0(m) {
                    N_n_0_24_rcvs_0(m)
                }
function IO_rcv_n_0_34_0(m) {
                    N_n_0_34_rcvs_0(m)
                }
function IO_rcv_n_0_36_0(m) {
                    N_n_0_36_rcvs_0(m)
                }
function IO_rcv_n_0_37_0(m) {
                    N_n_0_37_rcvs_0(m)
                }
function IO_rcv_n_0_38_0(m) {
                    N_n_0_38_rcvs_0(m)
                }
function IO_rcv_n_0_40_0(m) {
                    N_n_0_40_rcvs_0(m)
                }
function IO_rcv_n_0_41_0(m) {
                    N_n_0_41_rcvs_0(m)
                }
        

        const exports = {
            metadata: {"libVersion":"0.1.0","settings":{"audio":{"channelCount":{"in":2,"out":2},"bitDepth":64,"sampleRate":0,"blockSize":0},"io":{"messageReceivers":{"n_0_14":{"portletIds":["0"],"metadata":{"group":"control:float","type":"hsl","label":"VOL","position":[328,455],"initValue":0,"minValue":0,"maxValue":1}},"n_0_15":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"01_FRQ","position":[58,226],"initValue":0,"minValue":0,"maxValue":127}},"n_0_16":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"01_RUN","position":[108,226],"initValue":0,"minValue":0,"maxValue":127}},"n_0_17":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"02_FRQ","position":[158,226],"initValue":0,"minValue":0,"maxValue":127}},"n_0_18":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"02_RUN","position":[208,226],"initValue":0,"minValue":0,"maxValue":127}},"n_0_19":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"FIL_FRQ","position":[58,386],"initValue":0,"minValue":0,"maxValue":127}},"n_0_20":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"FIL_RES","position":[108,385],"initValue":0,"minValue":0,"maxValue":127}},"n_0_21":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"FIL_RUN","position":[158,386],"initValue":0,"minValue":0,"maxValue":127}},"n_0_22":{"portletIds":["0"],"metadata":{"group":"control:float","type":"vsl","label":"FIL_SWP","position":[208,386],"initValue":0,"minValue":0,"maxValue":127}},"n_0_23":{"portletIds":["0"],"metadata":{"group":"control:float","type":"tgl","label":"RANDOM","position":[102,53],"initValue":0,"minValue":0,"maxValue":1}},"n_0_24":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[102,77]}},"n_0_34":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[516,469]}},"n_0_36":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[516,442]}},"n_0_37":{"portletIds":["0"],"metadata":{"group":"control","type":"msg","position":[556,442]}},"n_0_38":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[516,367]}},"n_0_40":{"portletIds":["0"],"metadata":{"group":"control","type":"bng","label":"","position":[609,442]}},"n_0_41":{"portletIds":["0"],"metadata":{"group":"control:float","type":"tgl","label":"RECORD","position":[516,339],"initValue":0,"minValue":0,"maxValue":1}}},"messageSenders":{}}},"compilation":{"variableNamesIndex":{"io":{"messageReceivers":{"n_0_14":{"0":"IO_rcv_n_0_14_0"},"n_0_15":{"0":"IO_rcv_n_0_15_0"},"n_0_16":{"0":"IO_rcv_n_0_16_0"},"n_0_17":{"0":"IO_rcv_n_0_17_0"},"n_0_18":{"0":"IO_rcv_n_0_18_0"},"n_0_19":{"0":"IO_rcv_n_0_19_0"},"n_0_20":{"0":"IO_rcv_n_0_20_0"},"n_0_21":{"0":"IO_rcv_n_0_21_0"},"n_0_22":{"0":"IO_rcv_n_0_22_0"},"n_0_23":{"0":"IO_rcv_n_0_23_0"},"n_0_24":{"0":"IO_rcv_n_0_24_0"},"n_0_34":{"0":"IO_rcv_n_0_34_0"},"n_0_36":{"0":"IO_rcv_n_0_36_0"},"n_0_37":{"0":"IO_rcv_n_0_37_0"},"n_0_38":{"0":"IO_rcv_n_0_38_0"},"n_0_40":{"0":"IO_rcv_n_0_40_0"},"n_0_41":{"0":"IO_rcv_n_0_41_0"}},"messageSenders":{}},"globals":{"commons":{"getArray":"G_commons_getArray","setArray":"G_commons_setArray"},"fs":{"i_closeSoundStream":"G_fs_i_closeSoundStream","x_onCloseSoundStream":"G_fs_x_onCloseSoundStream","i_openSoundWriteStream":"G_fs_i_openSoundWriteStream","i_sendSoundStreamData":"G_fs_i_sendSoundStreamData"}}}}},
            initialize: (sampleRate, blockSize) => {
                exports.metadata.settings.audio.sampleRate = sampleRate
                exports.metadata.settings.audio.blockSize = blockSize
                SAMPLE_RATE = sampleRate
                BLOCK_SIZE = blockSize

                
                N_n_0_14_state.messageSender = N_m_n_0_13_1__routemsg_rcvs_0
                N_n_0_14_state.messageReceiver = function (m) {
                    NT_hsl_receiveMessage(N_n_0_14_state, m)
                }
                NT_hsl_setReceiveBusName(N_n_0_14_state, "empty")
    
                
            



                N_n_0_15_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
                N_n_0_15_state.messageReceiver = function (m) {
                    NT_vsl_receiveMessage(N_n_0_15_state, m)
                }
                NT_vsl_setReceiveBusName(N_n_0_15_state, "empty")
    
                
            

                N_n_0_16_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
                N_n_0_16_state.messageReceiver = function (m) {
                    NT_vsl_receiveMessage(N_n_0_16_state, m)
                }
                NT_vsl_setReceiveBusName(N_n_0_16_state, "empty")
    
                
            

                N_n_0_17_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
                N_n_0_17_state.messageReceiver = function (m) {
                    NT_vsl_receiveMessage(N_n_0_17_state, m)
                }
                NT_vsl_setReceiveBusName(N_n_0_17_state, "empty")
    
                
            

                N_n_0_18_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
                N_n_0_18_state.messageReceiver = function (m) {
                    NT_vsl_receiveMessage(N_n_0_18_state, m)
                }
                NT_vsl_setReceiveBusName(N_n_0_18_state, "empty")
    
                
            

                N_n_0_19_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
                N_n_0_19_state.messageReceiver = function (m) {
                    NT_vsl_receiveMessage(N_n_0_19_state, m)
                }
                NT_vsl_setReceiveBusName(N_n_0_19_state, "empty")
    
                
            

                N_n_0_20_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
                N_n_0_20_state.messageReceiver = function (m) {
                    NT_vsl_receiveMessage(N_n_0_20_state, m)
                }
                NT_vsl_setReceiveBusName(N_n_0_20_state, "empty")
    
                
            

                N_n_0_21_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
                N_n_0_21_state.messageReceiver = function (m) {
                    NT_vsl_receiveMessage(N_n_0_21_state, m)
                }
                NT_vsl_setReceiveBusName(N_n_0_21_state, "empty")
    
                
            

                N_n_0_22_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
                N_n_0_22_state.messageReceiver = function (m) {
                    NT_vsl_receiveMessage(N_n_0_22_state, m)
                }
                NT_vsl_setReceiveBusName(N_n_0_22_state, "empty")
    
                
            

                N_n_0_23_state.messageSender = N_n_0_24_rcvs_0
                N_n_0_23_state.messageReceiver = function (m) {
                    NT_tgl_receiveMessage(N_n_0_23_state, m)
                }
                NT_tgl_setReceiveBusName(N_n_0_23_state, "empty")
    
                
            

        N_n_0_24_state.messageReceiver = function (m) {
            NT_bang_receiveMessage(N_n_0_24_state, m)
        }
        N_n_0_24_state.messageSender = N_n_0_24_snds_0
        NT_bang_setReceiveBusName(N_n_0_24_state, "empty")

        
    









        N_n_0_35_state.sampleRatio = computeUnitInSamples(SAMPLE_RATE, 1, "msec")
        NT_delay_setDelay(N_n_0_35_state, 1000)
    

            N_n_0_36_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_36_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_36_state.msgSpecs[0].outTemplate = []

                N_n_0_36_state.msgSpecs[0].outTemplate.push(G_msg_STRING_TOKEN)
                N_n_0_36_state.msgSpecs[0].outTemplate.push(4)
            
N_n_0_36_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_36_state.msgSpecs[0].outTemplate)

                G_msg_writeStringToken(N_n_0_36_state.msgSpecs[0].outMessage, 0, "stop")
            
        



        N_n_0_40_state.messageReceiver = function (m) {
            NT_bang_receiveMessage(N_n_0_40_state, m)
        }
        N_n_0_40_state.messageSender = G_msg_VOID_MESSAGE_RECEIVER
        NT_bang_setReceiveBusName(N_n_0_40_state, "empty")

        
    

        N_n_0_38_state.messageReceiver = function (m) {
            NT_bang_receiveMessage(N_n_0_38_state, m)
        }
        N_n_0_38_state.messageSender = N_n_0_39_rcvs_0
        NT_bang_setReceiveBusName(N_n_0_38_state, "empty")

        
    


            N_n_0_37_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_37_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_37_state.msgSpecs[0].outTemplate = []

                N_n_0_37_state.msgSpecs[0].outTemplate.push(G_msg_STRING_TOKEN)
                N_n_0_37_state.msgSpecs[0].outTemplate.push(5)
            
N_n_0_37_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_37_state.msgSpecs[0].outTemplate)

                G_msg_writeStringToken(N_n_0_37_state.msgSpecs[0].outMessage, 0, "start")
            
        

            N_n_0_34_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_0_34_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_0_34_state.msgSpecs[0].outTemplate = []

                N_n_0_34_state.msgSpecs[0].outTemplate.push(G_msg_STRING_TOKEN)
                N_n_0_34_state.msgSpecs[0].outTemplate.push(4)
            

                N_n_0_34_state.msgSpecs[0].outTemplate.push(G_msg_STRING_TOKEN)
                N_n_0_34_state.msgSpecs[0].outTemplate.push(22)
            
N_n_0_34_state.msgSpecs[0].outMessage = G_msg_create(N_n_0_34_state.msgSpecs[0].outTemplate)

                G_msg_writeStringToken(N_n_0_34_state.msgSpecs[0].outMessage, 0, "open")
            

                G_msg_writeStringToken(N_n_0_34_state.msgSpecs[0].outMessage, 1, "benjolin-recording.wav")
            
        

                N_n_0_41_state.messageSender = N_n_0_38_rcvs_0
                N_n_0_41_state.messageReceiver = function (m) {
                    NT_tgl_receiveMessage(N_n_0_41_state, m)
                }
                NT_tgl_setReceiveBusName(N_n_0_41_state, "empty")
    
                
            

            G_msgBuses_subscribe("RESET", N_n_1_40_rcvs_0)
        

            N_n_1_40_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_1_40_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_1_40_state.msgSpecs[0].outTemplate = []

                N_n_1_40_state.msgSpecs[0].outTemplate.push(G_msg_STRING_TOKEN)
                N_n_1_40_state.msgSpecs[0].outTemplate.push(5)
            

                N_n_1_40_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_1_40_state.msgSpecs[0].outMessage = G_msg_create(N_n_1_40_state.msgSpecs[0].outTemplate)

                G_msg_writeStringToken(N_n_1_40_state.msgSpecs[0].outMessage, 0, "reset")
            

                G_msg_writeFloatToken(N_n_1_40_state.msgSpecs[0].outMessage, 1, 0)
            
        

















            G_msgBuses_subscribe("01_FRQ", N_n_2_15_rcvs_0)
        

            NT_div_setLeft(N_n_2_15_state, 0)
            NT_div_setRight(N_n_2_15_state, 128)
        

            NT_mul_setLeft(N_n_2_16_state, 0)
            NT_mul_setRight(N_n_2_16_state, 141)
        

            NT_sub_setLeft(N_n_2_17_state, 0)
            NT_sub_setRight(N_n_2_17_state, 61)
        



            G_msgBuses_subscribe("01_RUN", N_n_2_12_rcvs_0)
        

            NT_div_setLeft(N_n_2_12_state, 0)
            NT_div_setRight(N_n_2_12_state, 2)
        



            G_msgBuses_subscribe("RESET", N_n_3_11_rcvs_0)
        

            N_n_3_11_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_3_11_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_3_11_state.msgSpecs[0].outTemplate = []

                N_n_3_11_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_3_11_state.msgSpecs[0].outMessage = G_msg_create(N_n_3_11_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_3_11_state.msgSpecs[0].outMessage, 0, 0)
            
        

            NT_phasor_t_setStep(N_n_3_4_state, 0)
        

            G_msgBuses_subscribe("02_FRQ", N_n_5_15_rcvs_0)
        

            NT_div_setLeft(N_n_5_15_state, 0)
            NT_div_setRight(N_n_5_15_state, 128)
        

            NT_mul_setLeft(N_n_5_16_state, 0)
            NT_mul_setRight(N_n_5_16_state, 139)
        

            NT_sub_setLeft(N_n_5_17_state, 0)
            NT_sub_setRight(N_n_5_17_state, 59)
        



            G_msgBuses_subscribe("02_RUN", N_n_5_12_rcvs_0)
        

            NT_div_setLeft(N_n_5_12_state, 0)
            NT_div_setRight(N_n_5_12_state, 2)
        



            G_msgBuses_subscribe("RESET", N_n_6_11_rcvs_0)
        

            N_n_6_11_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
                            return N_n_6_11_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        
        
        
    
N_n_6_11_state.msgSpecs[0].outTemplate = []

                N_n_6_11_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_6_11_state.msgSpecs[0].outMessage = G_msg_create(N_n_6_11_state.msgSpecs[0].outTemplate)

                G_msg_writeFloatToken(N_n_6_11_state.msgSpecs[0].outMessage, 0, 0)
            
        

            NT_phasor_t_setStep(N_n_6_4_state, 0)
        

            G_msgBuses_subscribe("FIL_FRQ", N_n_7_2_rcvs_0)
        

            N_n_7_2_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
        
        
        let stringMem = []
    
N_n_7_2_state.msgSpecs[0].outTemplate = []

                N_n_7_2_state.msgSpecs[0].outTemplate.push(G_msg_getTokenType(inMessage, 0))
                if (G_msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = G_msg_readStringToken(inMessage, 0)
                    N_n_7_2_state.msgSpecs[0].outTemplate.push(stringMem[0].length)
                }
            

                N_n_7_2_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_7_2_state.msgSpecs[0].outMessage = G_msg_create(N_n_7_2_state.msgSpecs[0].outTemplate)

                if (G_msg_isFloatToken(inMessage, 0)) {
                    G_msg_writeFloatToken(N_n_7_2_state.msgSpecs[0].outMessage, 0, G_msg_readFloatToken(inMessage, 0))
                } else if (G_msg_isStringToken(inMessage, 0)) {
                    G_msg_writeStringToken(N_n_7_2_state.msgSpecs[0].outMessage, 0, stringMem[0])
                }
            

                G_msg_writeFloatToken(N_n_7_2_state.msgSpecs[0].outMessage, 1, 50)
            
                            return N_n_7_2_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        


            G_msgBuses_subscribe("$FIL_RUN", N_n_7_4_rcvs_0)
        

            NT_div_setLeft(N_n_7_4_state, 0)
            NT_div_setRight(N_n_7_4_state, 127)
        

            N_n_7_6_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
        
        
        let stringMem = []
    
N_n_7_6_state.msgSpecs[0].outTemplate = []

                N_n_7_6_state.msgSpecs[0].outTemplate.push(G_msg_getTokenType(inMessage, 0))
                if (G_msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = G_msg_readStringToken(inMessage, 0)
                    N_n_7_6_state.msgSpecs[0].outTemplate.push(stringMem[0].length)
                }
            

                N_n_7_6_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_7_6_state.msgSpecs[0].outMessage = G_msg_create(N_n_7_6_state.msgSpecs[0].outTemplate)

                if (G_msg_isFloatToken(inMessage, 0)) {
                    G_msg_writeFloatToken(N_n_7_6_state.msgSpecs[0].outMessage, 0, G_msg_readFloatToken(inMessage, 0))
                } else if (G_msg_isStringToken(inMessage, 0)) {
                    G_msg_writeStringToken(N_n_7_6_state.msgSpecs[0].outMessage, 0, stringMem[0])
                }
            

                G_msg_writeFloatToken(N_n_7_6_state.msgSpecs[0].outMessage, 1, 50)
            
                            return N_n_7_6_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        


            G_msgBuses_subscribe("FIL_SWP", N_n_7_9_rcvs_0)
        

            NT_div_setLeft(N_n_7_9_state, 0)
            NT_div_setRight(N_n_7_9_state, 127)
        

            N_n_7_11_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
        
        
        let stringMem = []
    
N_n_7_11_state.msgSpecs[0].outTemplate = []

                N_n_7_11_state.msgSpecs[0].outTemplate.push(G_msg_getTokenType(inMessage, 0))
                if (G_msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = G_msg_readStringToken(inMessage, 0)
                    N_n_7_11_state.msgSpecs[0].outTemplate.push(stringMem[0].length)
                }
            

                N_n_7_11_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_7_11_state.msgSpecs[0].outMessage = G_msg_create(N_n_7_11_state.msgSpecs[0].outTemplate)

                if (G_msg_isFloatToken(inMessage, 0)) {
                    G_msg_writeFloatToken(N_n_7_11_state.msgSpecs[0].outMessage, 0, G_msg_readFloatToken(inMessage, 0))
                } else if (G_msg_isStringToken(inMessage, 0)) {
                    G_msg_writeStringToken(N_n_7_11_state.msgSpecs[0].outMessage, 0, stringMem[0])
                }
            

                G_msg_writeFloatToken(N_n_7_11_state.msgSpecs[0].outMessage, 1, 50)
            
                            return N_n_7_11_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        


            G_msgBuses_subscribe("FIL_RES", N_n_7_25_snds_0)
        

            NT_div_setLeft(N_n_7_31_state, 0)
            NT_div_setRight(N_n_7_31_state, 128)
        

            NT_mul_setLeft(N_n_7_32_state, 0)
            NT_mul_setRight(N_n_7_32_state, 33)
        

            NT_sub_setLeft(N_n_7_33_state, 0)
            NT_sub_setRight(N_n_7_33_state, 3)
        

            N_n_7_19_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
        
        
        let stringMem = []
    
N_n_7_19_state.msgSpecs[0].outTemplate = []

                N_n_7_19_state.msgSpecs[0].outTemplate.push(G_msg_getTokenType(inMessage, 0))
                if (G_msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = G_msg_readStringToken(inMessage, 0)
                    N_n_7_19_state.msgSpecs[0].outTemplate.push(stringMem[0].length)
                }
            

                N_n_7_19_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_7_19_state.msgSpecs[0].outMessage = G_msg_create(N_n_7_19_state.msgSpecs[0].outTemplate)

                if (G_msg_isFloatToken(inMessage, 0)) {
                    G_msg_writeFloatToken(N_n_7_19_state.msgSpecs[0].outMessage, 0, G_msg_readFloatToken(inMessage, 0))
                } else if (G_msg_isStringToken(inMessage, 0)) {
                    G_msg_writeStringToken(N_n_7_19_state.msgSpecs[0].outMessage, 0, stringMem[0])
                }
            

                G_msg_writeFloatToken(N_n_7_19_state.msgSpecs[0].outMessage, 1, 50)
            
                            return N_n_7_19_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        

            NT_line_setGrain(N_n_7_38_state, 20)
            N_n_7_38_state.snd0 = N_n_7_39_rcvs_2
            N_n_7_38_state.tickCallback = function () {
                NT_line_tick(N_n_7_38_state)
            }
        


            NT_div_setLeft(N_n_7_34_state, 0)
            NT_div_setRight(N_n_7_34_state, 128)
        

            NT_mul_setLeft(N_n_7_35_state, 0)
            NT_mul_setRight(N_n_7_35_state, 14)
        

            NT_sub_setLeft(N_n_7_36_state, 0)
            NT_sub_setRight(N_n_7_36_state, 2)
        

            N_n_7_27_state.msgSpecs = [
                
                    {
                        transferFunction: function (inMessage) {
                            
        
        
        let stringMem = []
    
N_n_7_27_state.msgSpecs[0].outTemplate = []

                N_n_7_27_state.msgSpecs[0].outTemplate.push(G_msg_getTokenType(inMessage, 0))
                if (G_msg_isStringToken(inMessage, 0)) {
                    stringMem[0] = G_msg_readStringToken(inMessage, 0)
                    N_n_7_27_state.msgSpecs[0].outTemplate.push(stringMem[0].length)
                }
            

                N_n_7_27_state.msgSpecs[0].outTemplate.push(G_msg_FLOAT_TOKEN)
            
N_n_7_27_state.msgSpecs[0].outMessage = G_msg_create(N_n_7_27_state.msgSpecs[0].outTemplate)

                if (G_msg_isFloatToken(inMessage, 0)) {
                    G_msg_writeFloatToken(N_n_7_27_state.msgSpecs[0].outMessage, 0, G_msg_readFloatToken(inMessage, 0))
                } else if (G_msg_isStringToken(inMessage, 0)) {
                    G_msg_writeStringToken(N_n_7_27_state.msgSpecs[0].outMessage, 0, stringMem[0])
                }
            

                G_msg_writeFloatToken(N_n_7_27_state.msgSpecs[0].outMessage, 1, 50)
            
                            return N_n_7_27_state.msgSpecs[0].outMessage
                        },
                        outTemplate: [],
                        outMessage: G_msg_EMPTY_MESSAGE,
                        send: "",
                        hasSend: false,
                    },
            ]

            
        



















        NT_receive_t_setBusName(N_n_1_31_state, "0-5-sh")
    

        NT_receive_t_setBusName(N_n_0_6_state, "O2pls")
    

            
            
        

        NT_receive_t_setBusName(N_n_1_30_state, "0-6-sh")
    

        NT_receive_t_setBusName(N_n_1_29_state, "0-7-sh")
    

            
            
        



























            
            
        











            
            
        















        NT_receive_t_setBusName(N_n_0_5_state, "O1pls")
    

            
            
        


            
            
        

        NT_send_t_setBusName(N_n_1_22_state, "0-1-sh")
    

        NT_receive_t_setBusName(N_n_1_35_state, "0-1-sh")
    

        NT_send_t_setBusName(N_n_1_23_state, "0-2-sh")
    

        NT_receive_t_setBusName(N_n_1_34_state, "0-2-sh")
    

        NT_send_t_setBusName(N_n_1_24_state, "0-3-sh")
    

        NT_receive_t_setBusName(N_n_1_33_state, "0-3-sh")
    

        NT_send_t_setBusName(N_n_1_25_state, "0-4-sh")
    

        NT_receive_t_setBusName(N_n_1_32_state, "0-4-sh")
    

        NT_send_t_setBusName(N_n_1_26_state, "0-5-sh")
    

        NT_send_t_setBusName(N_n_1_27_state, "0-6-sh")
    

        NT_send_t_setBusName(N_n_1_28_state, "0-7-sh")
    

            
            
        

            
            
        

        NT_send_t_setBusName(N_n_2_11_state, "O1pls")
    

            
            
        

            
            
        

        NT_send_t_setBusName(N_n_5_11_state, "O2pls")
    
                COLD_0(G_msg_EMPTY_MESSAGE)
COLD_1(G_msg_EMPTY_MESSAGE)
COLD_2(G_msg_EMPTY_MESSAGE)
            },
            dspLoop: (INPUT, OUTPUT) => {
                
        for (IT_FRAME = 0; IT_FRAME < BLOCK_SIZE; IT_FRAME++) {
            G_commons__emitFrame(FRAME)
            N_n_1_21_outs_0 = +((G_sigBuses_read(N_n_0_6_state.busName)) > 0)

        N_n_1_7_state.signalMemory = N_n_1_7_outs_0 = N_n_1_21_outs_0 < N_n_1_7_state.controlMemory ? (G_sigBuses_read(N_n_1_31_state.busName)): N_n_1_7_state.signalMemory
        N_n_1_7_state.controlMemory = N_n_1_21_outs_0
    

        N_n_1_8_state.signalMemory = N_n_1_8_outs_0 = N_n_1_21_outs_0 < N_n_1_8_state.controlMemory ? (G_sigBuses_read(N_n_1_30_state.busName)): N_n_1_8_state.signalMemory
        N_n_1_8_state.controlMemory = N_n_1_21_outs_0
    

        N_n_1_9_state.signalMemory = N_n_1_9_outs_0 = N_n_1_21_outs_0 < N_n_1_9_state.controlMemory ? (G_sigBuses_read(N_n_1_29_state.busName)): N_n_1_9_state.signalMemory
        N_n_1_9_state.controlMemory = N_n_1_21_outs_0
    
N_n_1_15_outs_0 = +(((N_n_1_7_outs_0/8)+(N_n_1_8_outs_0/4)+(N_n_1_9_outs_0/2)))

        N_n_2_0_outs_0 = N_n_2_0_state.currentValue
        if (toFloat(FRAME) < N_n_2_0_state.currentLine.p1.x) {
            N_n_2_0_state.currentValue += N_n_2_0_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_2_0_state.currentLine.p1.x) {
                N_n_2_0_state.currentValue = N_n_2_0_state.currentLine.p1.y
            }
        }
    

        N_n_2_2_outs_0 = N_n_2_2_state.currentValue
        if (toFloat(FRAME) < N_n_2_2_state.currentLine.p1.x) {
            N_n_2_2_state.currentValue += N_n_2_2_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_2_2_state.currentLine.p1.x) {
                N_n_2_2_state.currentValue = N_n_2_2_state.currentLine.p1.y
            }
        }
    
NT_phasor_t_setStep(N_n_3_4_state, (G_funcs_mtof((Math.max(Math.min(N_n_2_7_state.maxValue, (N_n_2_0_outs_0 + (N_n_1_15_outs_0 * N_n_2_2_outs_0))), N_n_2_7_state.minValue)))))

                N_n_3_4_outs_0 = N_n_3_4_state.phase % 1
                N_n_3_4_state.phase += N_n_3_4_state.step
            

        N_n_5_0_outs_0 = N_n_5_0_state.currentValue
        if (toFloat(FRAME) < N_n_5_0_state.currentLine.p1.x) {
            N_n_5_0_state.currentValue += N_n_5_0_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_5_0_state.currentLine.p1.x) {
                N_n_5_0_state.currentValue = N_n_5_0_state.currentLine.p1.y
            }
        }
    

        N_n_5_2_outs_0 = N_n_5_2_state.currentValue
        if (toFloat(FRAME) < N_n_5_2_state.currentLine.p1.x) {
            N_n_5_2_state.currentValue += N_n_5_2_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_5_2_state.currentLine.p1.x) {
                N_n_5_2_state.currentValue = N_n_5_2_state.currentLine.p1.y
            }
        }
    
NT_phasor_t_setStep(N_n_6_4_state, (G_funcs_mtof((Math.max(Math.min(N_n_5_7_state.maxValue, (N_n_5_0_outs_0 + (N_n_1_15_outs_0 * N_n_5_2_outs_0))), N_n_5_7_state.minValue)))))

                N_n_6_4_outs_0 = N_n_6_4_state.phase % 1
                N_n_6_4_state.phase += N_n_6_4_state.step
            
N_n_6_6_outs_0 = ((Math.max(((N_n_6_4_outs_0 * (N_m_n_6_1_1_sig_state.currentValue)) + (N_m_n_6_2_1_sig_state.currentValue)), N_n_6_4_outs_0)) * (N_m_n_6_3_1_sig_state.currentValue)) + (N_m_n_6_6_1_sig_state.currentValue)
N_n_4_3_outs_0 = +((((Math.max(((N_n_3_4_outs_0 * (N_m_n_3_1_1_sig_state.currentValue)) + (N_m_n_3_2_1_sig_state.currentValue)), N_n_3_4_outs_0)) * (N_m_n_3_3_1_sig_state.currentValue)) + (N_m_n_3_6_1_sig_state.currentValue)) > N_n_6_6_outs_0)

        N_n_7_1_outs_0 = N_n_7_1_state.currentValue
        if (toFloat(FRAME) < N_n_7_1_state.currentLine.p1.x) {
            N_n_7_1_state.currentValue += N_n_7_1_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_7_1_state.currentLine.p1.x) {
                N_n_7_1_state.currentValue = N_n_7_1_state.currentLine.p1.y
            }
        }
    

        N_n_7_5_outs_0 = N_n_7_5_state.currentValue
        if (toFloat(FRAME) < N_n_7_5_state.currentLine.p1.x) {
            N_n_7_5_state.currentValue += N_n_7_5_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_7_5_state.currentLine.p1.x) {
                N_n_7_5_state.currentValue = N_n_7_5_state.currentLine.p1.y
            }
        }
    

        N_n_7_10_outs_0 = N_n_7_10_state.currentValue
        if (toFloat(FRAME) < N_n_7_10_state.currentLine.p1.x) {
            N_n_7_10_state.currentValue += N_n_7_10_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_7_10_state.currentLine.p1.x) {
                N_n_7_10_state.currentValue = N_n_7_10_state.currentLine.p1.y
            }
        }
    
N_n_7_13_outs_0 = +(N_n_7_1_outs_0+N_m_n_7_13_1_sig_outs_0+(N_n_7_5_outs_0 * (N_n_1_15_outs_0 * (N_m_n_7_7_1_sig_state.currentValue)))+(N_n_7_10_outs_0 * (N_n_6_6_outs_0 * (N_m_n_7_12_1_sig_state.currentValue))))

                NT_vcf_t_setFrequency(N_n_7_39_state, (G_funcs_mtof((Math.max(Math.min(N_n_7_14_state.maxValue, N_n_7_13_outs_0), N_n_7_14_state.minValue)))))
            

            N_n_7_39_state.y = ((N_n_1_15_outs_0 + N_n_4_3_outs_0) * (N_m_n_0_7_1_sig_state.currentValue)) + N_n_7_39_state.coef1 * N_n_7_39_state.ym1 + N_n_7_39_state.coef2 * N_n_7_39_state.ym2
            N_n_7_39_outs_1 = N_n_7_39_outs_0 = N_n_7_39_state.gain * N_n_7_39_state.y
            N_n_7_39_state.ym2 = N_n_7_39_state.ym1
            N_n_7_39_state.ym1 = N_n_7_39_state.y
        

        N_n_7_26_outs_0 = N_n_7_26_state.currentValue
        if (toFloat(FRAME) < N_n_7_26_state.currentLine.p1.x) {
            N_n_7_26_state.currentValue += N_n_7_26_state.currentLine.dy
            if (toFloat(FRAME + 1) >= N_n_7_26_state.currentLine.p1.x) {
                N_n_7_26_state.currentValue = N_n_7_26_state.currentLine.p1.y
            }
        }
    

            N_n_0_11_state.current = (N_n_7_39_outs_0 * N_n_7_26_outs_0) + N_n_0_11_state.coeff * N_n_0_11_state.previous
            N_n_0_11_outs_0 = N_n_0_11_state.normal * (N_n_0_11_state.current - N_n_0_11_state.previous)
            N_n_0_11_state.previous = N_n_0_11_state.current
        

            N_n_8_4_state.lastOutput = N_n_8_4_outs_0 = N_n_0_11_outs_0 - N_m_n_8_4_1_sig_outs_0 * N_n_8_4_state.lastInput
            N_n_8_4_state.lastInput = N_n_0_11_outs_0
        
N_n_0_0_outs_0 = ((Math.max(Math.min(N_n_8_5_state.maxValue, N_n_0_11_outs_0), N_n_8_5_state.minValue)) * (N_n_8_4_outs_0 - N_n_0_11_outs_0)) * (N_m_n_0_0_1_sig_state.currentValue)
N_n_0_13_outs_0 = N_n_0_0_outs_0 * (N_m_n_0_13_1_sig_state.currentValue)
OUTPUT[0][IT_FRAME] = N_n_0_13_outs_0
OUTPUT[1][IT_FRAME] = N_n_0_13_outs_0

        if (N_n_0_33_state.isWriting === true) {
            N_n_0_33_state.block[0][N_n_0_33_state.cursor] = N_n_0_0_outs_0
            N_n_0_33_state.cursor++
            if (N_n_0_33_state.cursor === 220500) {
                NT_write_t_flushBlock(N_n_0_33_state)
            }
        }
    
N_n_1_16_outs_0 = +((G_sigBuses_read(N_n_0_5_state.busName)) >~ 0.5)
N_n_1_36_outs_0 = +((Math.max(Math.min(N_n_1_10_state.maxValue, N_n_1_16_outs_0), N_n_1_10_state.minValue)) ^ N_n_1_9_outs_0)

        N_n_1_2_state.signalMemory = N_n_1_2_outs_0 = N_n_1_21_outs_0 < N_n_1_2_state.controlMemory ? N_n_1_36_outs_0: N_n_1_2_state.signalMemory
        N_n_1_2_state.controlMemory = N_n_1_21_outs_0
    

        G_sigBuses_set(N_n_1_22_state.busName, N_n_1_2_outs_0)
    

        N_n_1_3_state.signalMemory = N_n_1_3_outs_0 = N_n_1_21_outs_0 < N_n_1_3_state.controlMemory ? (G_sigBuses_read(N_n_1_35_state.busName)): N_n_1_3_state.signalMemory
        N_n_1_3_state.controlMemory = N_n_1_21_outs_0
    

        G_sigBuses_set(N_n_1_23_state.busName, N_n_1_3_outs_0)
    

        N_n_1_4_state.signalMemory = N_n_1_4_outs_0 = N_n_1_21_outs_0 < N_n_1_4_state.controlMemory ? (G_sigBuses_read(N_n_1_34_state.busName)): N_n_1_4_state.signalMemory
        N_n_1_4_state.controlMemory = N_n_1_21_outs_0
    

        G_sigBuses_set(N_n_1_24_state.busName, N_n_1_4_outs_0)
    

        N_n_1_5_state.signalMemory = N_n_1_5_outs_0 = N_n_1_21_outs_0 < N_n_1_5_state.controlMemory ? (G_sigBuses_read(N_n_1_33_state.busName)): N_n_1_5_state.signalMemory
        N_n_1_5_state.controlMemory = N_n_1_21_outs_0
    

        G_sigBuses_set(N_n_1_25_state.busName, N_n_1_5_outs_0)
    

        N_n_1_6_state.signalMemory = N_n_1_6_outs_0 = N_n_1_21_outs_0 < N_n_1_6_state.controlMemory ? (G_sigBuses_read(N_n_1_32_state.busName)): N_n_1_6_state.signalMemory
        N_n_1_6_state.controlMemory = N_n_1_21_outs_0
    

        G_sigBuses_set(N_n_1_26_state.busName, N_n_1_6_outs_0)
    

        G_sigBuses_set(N_n_1_27_state.busName, N_n_1_7_outs_0)
    

        G_sigBuses_set(N_n_1_28_state.busName, N_n_1_8_outs_0)
    
N_n_3_7_outs_0 = +(N_n_3_4_outs_0 < 0.5)
N_n_3_10_outs_0 = +((N_n_3_7_outs_0 * 2) - 1)

        G_sigBuses_set(N_n_2_11_state.busName, N_n_3_10_outs_0)
    
N_n_6_7_outs_0 = +(N_n_6_4_outs_0 < 0.5)
N_n_6_10_outs_0 = +((N_n_6_7_outs_0 * 2) - 1)

        G_sigBuses_set(N_n_5_11_state.busName, N_n_6_10_outs_0)
    
            FRAME++
        }
    
            },
            io: {
                messageReceivers: {
                    n_0_14: {
                            "0": IO_rcv_n_0_14_0,
                        },
n_0_15: {
                            "0": IO_rcv_n_0_15_0,
                        },
n_0_16: {
                            "0": IO_rcv_n_0_16_0,
                        },
n_0_17: {
                            "0": IO_rcv_n_0_17_0,
                        },
n_0_18: {
                            "0": IO_rcv_n_0_18_0,
                        },
n_0_19: {
                            "0": IO_rcv_n_0_19_0,
                        },
n_0_20: {
                            "0": IO_rcv_n_0_20_0,
                        },
n_0_21: {
                            "0": IO_rcv_n_0_21_0,
                        },
n_0_22: {
                            "0": IO_rcv_n_0_22_0,
                        },
n_0_23: {
                            "0": IO_rcv_n_0_23_0,
                        },
n_0_24: {
                            "0": IO_rcv_n_0_24_0,
                        },
n_0_34: {
                            "0": IO_rcv_n_0_34_0,
                        },
n_0_36: {
                            "0": IO_rcv_n_0_36_0,
                        },
n_0_37: {
                            "0": IO_rcv_n_0_37_0,
                        },
n_0_38: {
                            "0": IO_rcv_n_0_38_0,
                        },
n_0_40: {
                            "0": IO_rcv_n_0_40_0,
                        },
n_0_41: {
                            "0": IO_rcv_n_0_41_0,
                        },
                },
                messageSenders: {
                    
                },
            }
        }

        
                exports.G_fs_i_closeSoundStream = () => { throw new Error('import for G_fs_i_closeSoundStream not provided') }
                const G_fs_i_closeSoundStream = (...args) => exports.G_fs_i_closeSoundStream(...args)
            

                exports.G_fs_i_openSoundWriteStream = () => { throw new Error('import for G_fs_i_openSoundWriteStream not provided') }
                const G_fs_i_openSoundWriteStream = (...args) => exports.G_fs_i_openSoundWriteStream(...args)
            

                exports.G_fs_i_sendSoundStreamData = () => { throw new Error('import for G_fs_i_sendSoundStreamData not provided') }
                const G_fs_i_sendSoundStreamData = (...args) => exports.G_fs_i_sendSoundStreamData(...args)
            
exports.G_commons_getArray = G_commons_getArray
exports.G_commons_setArray = G_commons_setArray
exports.G_fs_x_onCloseSoundStream = G_fs_x_onCloseSoundStream
    