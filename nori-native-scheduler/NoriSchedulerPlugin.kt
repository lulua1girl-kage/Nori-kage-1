package com.nori.kage.scheduler

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.PluginMethod

@CapacitorPlugin(name = "NoriScheduler")
class NoriSchedulerPlugin : Plugin() {

    @PluginMethod
    fun scheduleDailyCheckIn(call: PluginCall) {
        val trigger = NoriAlarmScheduler.schedule(bridge.context)
        if (trigger == null) {
            call.resolve(JSObject().put("scheduled", false).put("reason", "exact_alarm_permission"))
            return
        }
        call.resolve(JSObject().put("scheduled", true).put("nextTrigger", trigger).put("notificationsEnabled", NotificationManagerCompat.from(bridge.context).areNotificationsEnabled()))
    }

    @PluginMethod
    fun cancelDailyCheckIn(call: PluginCall) {
        NoriAlarmScheduler.cancel(bridge.context)
        call.resolve(JSObject().put("cancelled", true))
    }

    @PluginMethod
    fun openExactAlarmSettings(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val uri = Uri.parse("package:" + bridge.context.packageName)
            bridge.activity.startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, uri))
        }
        call.resolve()
    }

    @PluginMethod
    fun requestNotificationPermission(call: PluginCall) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            bridge.activity.requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 6013)
        }
        call.resolve()
    }
}
