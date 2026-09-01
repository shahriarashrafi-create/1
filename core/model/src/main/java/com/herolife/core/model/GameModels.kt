package com.herolife.core.model

data class PlayerProgress(
    val level: Int,
    val xp: Int,
    val xpToNextLevel: Int
) {
    val progressFraction: Float
        get() = if (xpToNextLevel <= 0) 0f
        else (xp.toFloat() / xpToNextLevel.toFloat()).coerceIn(0f, 1f)
}

data class GameWallet(
    val gold: Long,
    val diamonds: Long
)

enum class TaskPriority(val weight: Int) {
    CRITICAL(4),
    HIGH(3),
    MEDIUM(2),
    LOW(1)
}

enum class GameLane {
    NETWORKING,
    GROWTH,
    PERSONAL
}

data class TaskDefinition(
    val id: String,
    val title: String,
    val isActive: Boolean = true,
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val lane: GameLane = GameLane.PERSONAL,
    val estimatedMinutes: Int = 5,
    val xpReward: Int = 10,
    val goldReward: Int = 5,
    val diamondReward: Int = 0
)
