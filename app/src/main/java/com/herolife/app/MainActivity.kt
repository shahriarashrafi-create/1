package com.herolife.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import com.herolife.core.model.GameWallet
import com.herolife.core.model.PlayerProgress

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HeroLifeTheme {
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    HomeShell()
                }
            }
        }
    }
}

@Composable
private fun HeroLifeTheme(content: @Composable () -> Unit) {
    val scheme = darkColorScheme(
        primary = Color(0xFFD8AF56),
        secondary = Color(0xFF56C7FF),
        background = Color(0xFF07111F),
        surface = Color(0xFF0E1A2B),
        onPrimary = Color(0xFF101010),
        onBackground = Color(0xFFF5F7FA),
        onSurface = Color(0xFFF5F7FA)
    )
    MaterialTheme(colorScheme = scheme, content = content)
}

@Composable
private fun HomeShell() {
    val progress = PlayerProgress(level = 1, xp = 0, xpToNextLevel = 100)
    val wallet = GameWallet(gold = 0, diamonds = 0)

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF0A1626)) {
                listOf("خانه", "کارها", "آمار تیم", "برنامه زمانی", "شبکه‌سازی").forEachIndexed { index, label ->
                    NavigationBarItem(
                        selected = index == 0,
                        onClick = {},
                        icon = { Text(if (index == 0) "◆" else "◇") },
                        label = { Text(label, fontSize = 10.sp) }
                    )
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("HeroLife", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold)
            Text("هسته پروژه آماده است", color = Color(0xFF9CB0C8))

            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color(0xFF0E1A2B),
                shape = RoundedCornerShape(20.dp)
            ) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("سطح ${progress.level}", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    LinearProgressIndicator(
                        progress = { progress.progressFraction },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("⭐ ${progress.xp}/${progress.xpToNextLevel}")
                        Text("🪙 ${wallet.gold}")
                        Text("💎 ${wallet.diamonds}")
                    }
                }
            }

            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp),
                color = Color(0xFF101F32),
                shape = RoundedCornerShape(24.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("قهرمان شما", fontWeight = FontWeight.Bold, fontSize = 22.sp)
                        Spacer(Modifier.height(10.dp))
                        Text("ماژول Hero در مرحله 05 اضافه می‌شود", color = Color(0xFF9CB0C8))
                    }
                }
            }

            Button(
                onClick = {},
                modifier = Modifier
                    .fillMaxWidth()
                    .height(58.dp),
                shape = RoundedCornerShape(18.dp)
            ) {
                Text("⚔ شروع بازی", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
            }

            Text(
                "این صفحه عمداً یک Shell ساده است تا از مرحله 02 Design System به بعد UI نهایی روی همین معماری ساخته شود.",
                color = Color(0xFF8396AE),
                fontSize = 12.sp
            )
        }
    }
}
