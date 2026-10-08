package com.nori.kage.scheduler

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class NoriCheckInReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val channelId = "nori_daily_checkin"
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(
                NotificationChannel(
                    channelId,
                    "Nori daily check-ins",
                    NotificationManager.IMPORTANCE_HIGH
                )
            )
        }

        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val contentIntent = launch?.let {
            PendingIntent.getActivity(
                context,
                60019,
                it,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        val body = "What did you accomplish? What remains? Any deadlines tomorrow? How is your capacity? Any distraction incident? What is your next action?"
        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle("NORI — Daily Command Check-in")
            .setContentText("Open Nori and report what actually happened today.")
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        if (contentIntent != null) builder.setContentIntent(contentIntent)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            NotificationManagerCompat.from(context).notify(60018, builder.build())
        }

        NoriAlarmScheduler.schedule(context)
    }
}