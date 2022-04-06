/** alarms in Storage API
 * this keeps track of alarmName, as tabId might change during chrome prerendering
 * also keeps track of the alarm duration for animation purposes
 */
import { nanoid } from 'nanoid'

export default class LocalAlarm {
    alarmName: string
    tabId: number
    duration: number

    constructor(tabId: number, duration: number) {
        this.alarmName = nanoid();
        this.tabId = tabId;
        this.duration = duration;
    }
}