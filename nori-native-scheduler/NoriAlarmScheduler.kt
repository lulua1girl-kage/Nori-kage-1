package com.nori.kage.scheduler

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

object NoriAlarmScheduler {
    const val ACTION_DAILY_CHECKIN = "com.nori.kage.scheduler.DAILY_CHECKIN"
    private const val REQUEST_CODE = 60018

    fun canScheduleExactAlarms(context: Context): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true
        val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        return manager.canScheduleExactAlarms()
    }

    fun nextSixPmMillis(): Long {
        val now = Calendar.getInstance()
        val target = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 18)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        if (target.timeInMillis <= now.timeInMillis) target.add(Calendar.DAY_OF_YEAR, 1)
        return target.timeInMillis
    }

    fun schedule(context: Context): Long? {
        if (!canScheduleExactAlarms(context)) return null
        val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, NoriCheckInReceiver::class.java).setAction(ACTION_DAILY_CHECKIN)
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pending = PendingIntent.getBroadcast(context, REQUEST_CODE, intent, flags)
        val trigger = nextSixPmMillis()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pending)
        } else {
            manager.setExact(AlarmManager.RTC_WAKEUP, trigger, pending)
        }
        return trigger
    }

    fun cancel(context: Context) {
        val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, NoriCheckInReceiver::class.java).setAction(ACTION_DAILY_CHECKIN)
        val pending = PendingIntent.getBroadcast(
            context, REQUEST_CODE, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        manager.cancel(pending)
        pending.cancel()
    }
}