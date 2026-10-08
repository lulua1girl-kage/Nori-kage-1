# Nori daily 6 PM check-in

Nori's daily check-in uses a native Android exact alarm as the primary scheduler. The alarm is based on the device's local time and fires at 18:00.

The Capacitor build copies the Kotlin scheduler into the generated Android project, registers the plugin in MainActivity, and adds the required Android permissions/receivers.

The app uses the user-granted Alarms & reminders access when Android requires exact alarms, plus notification permission on Android 13 and newer. The receiver posts one focused notification and schedules the next day's alarm. Boot, time changes, timezone changes, package replacement, and exact-alarm permission changes reschedule the next notification.

The web layer keeps a browser fallback for development, but that fallback is intentionally treated as non-authoritative because JavaScript timers cannot guarantee delivery when the app is closed.

The notification content is a mentor check-in, not a form. The user can answer naturally, and Nori interprets the response.