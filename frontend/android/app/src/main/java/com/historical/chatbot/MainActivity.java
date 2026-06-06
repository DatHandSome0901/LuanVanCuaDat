package com.historical.chatbot;

import android.os.Bundle;
import android.view.View;
import androidx.core.view.ViewCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Prevent parent view from double-applying insets and squishing the WebView
        getBridge().getWebView().post(() -> {
            View parent = (View) getBridge().getWebView().getParent();
            ViewCompat.setOnApplyWindowInsetsListener(parent, (v, insets) -> {
                v.setPadding(0, 0, 0, 0);
                return insets;
            });
            getBridge().getWebView().requestApplyInsets();
        });
    }
}

