package com.aitam.hearassist;

import android.Manifest;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;

@CapacitorPlugin(
    name = "DirectSms",
    permissions = {
        @Permission(strings = {Manifest.permission.SEND_SMS}, alias = "sms")
    }
)
public class DirectSmsPlugin extends Plugin {

    @PluginMethod
    public void sendDirectSms(PluginCall call) {
        String phone = call.getString("phone");
        String message = call.getString("message");

        if (phone == null || message == null) {
            call.reject("Phone number and message are required");
            return;
        }

        if (ContextCompat.checkSelfPermission(getContext(), Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissionForAlias("sms", call, "smsPermissionCallback");
            return;
        }

        sendSmsInternal(phone, message, call);
    }

    @PermissionCallback
    private void smsPermissionCallback(PluginCall call) {
        if (getPermissionState("sms") == PermissionState.GRANTED) {
            String phone = call.getString("phone");
            String message = call.getString("message");
            sendSmsInternal(phone, message, call);
        } else {
            call.reject("SEND_SMS permission denied by user");
        }
    }

    private void sendSmsInternal(String phone, String message, PluginCall call) {
        try {
            SmsManager smsManager;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                smsManager = getContext().getSystemService(SmsManager.class);
            } else {
                smsManager = SmsManager.getDefault();
            }

            if (message.length() > 160) {
                ArrayList<String> parts = smsManager.divideMessage(message);
                smsManager.sendMultipartTextMessage(phone, null, parts, null, null);
            } else {
                smsManager.sendTextMessage(phone, null, message, null, null);
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to send direct SMS: " + e.getMessage());
        }
    }
}
