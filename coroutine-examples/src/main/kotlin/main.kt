data class ThreadTiming(
    val name: String,
    val startedAt: Long,
    var lastSeenAt: Long,
    var finishedAt: Long? = null
) {
    val livedForMillis: Long
        get() = (finishedAt ?: lastSeenAt) - startedAt
}

class ThreadNameStore {
    companion object {
        private val threadTimings = mutableMapOf<String, ThreadTiming>()

        @Synchronized
        fun markThreadStarted() {
            val threadName = Thread.currentThread().name
            val now = System.currentTimeMillis()

            threadTimings.getOrPut(threadName) {
                ThreadTiming(
                    name = threadName,
                    startedAt = now,
                    lastSeenAt = now
                )
            }
        }

        @Synchronized
        fun markThreadSeen() {
            val threadName = Thread.currentThread().name
            val now = System.currentTimeMillis()

            val timing = threadTimings.getOrPut(threadName) {
                ThreadTiming(
                    name = threadName,
                    startedAt = now,
                    lastSeenAt = now
                )
            }

            if (timing.finishedAt == null) {
                timing.lastSeenAt = now
            }
        }

        @Synchronized
        fun markThreadFinished() {
            markThreadSeen()
            threadTimings[Thread.currentThread().name]?.finishedAt = System.currentTimeMillis()
        }

        @Synchronized
        fun getThreadNames(): Set<String> = threadTimings.keys.toSet()

        @Synchronized
        fun getThreadTimings(): List<ThreadTiming> = threadTimings.values
            .map { timing ->
                timing.copy()
            }
            .sortedBy { timing ->
                timing.startedAt
            }
    }
}

fun <T> measureTime(block: () -> T): Pair<T, Long> {
    val startedAt = System.currentTimeMillis()
    val result = block()
    val finishedAt = System.currentTimeMillis()

    return result to finishedAt - startedAt
}

fun log(message: String) {
    ThreadNameStore.markThreadSeen()
    val time = java.time.LocalTime.now().format(
        java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss.SSS")
    )
    val threadName = Thread.currentThread().name.padEnd(20)
    val paddedMessage = message.padEnd(100)

    println("$time | $threadName | $paddedMessage")
}

fun trackedThread(name: String, block: () -> Unit): Thread {
    val worker = Thread({
        ThreadNameStore.markThreadStarted()

        try {
            block()
        } finally {
            ThreadNameStore.markThreadFinished()
        }
    }, name)

    worker.start()
    return worker
}

fun runTrackedMain(label: String, block: () -> Unit) {
    ThreadNameStore.markThreadStarted()
    val (_, elapsedMillis) = measureTime {
        block()
    }
    ThreadNameStore.markThreadFinished()

    printSummary(label, elapsedMillis)
}

fun printSummary(label: String, elapsedMillis: Long) {
    val threadTimings = ThreadNameStore.getThreadTimings()

    println()
    println("========== $label summary ==========")
    println("Total time    : $elapsedMillis ms")
    println("Total threads : ${threadTimings.size}")
    println("Thread timings:")
    threadTimings.forEach { timing ->
        println("  - ${timing.name}: ${timing.livedForMillis} ms")
    }
    println("======================================")
}

const val WEEK = 100L

val WINDOW_ORDER_TIME = (5 * WEEK).toLong()
val DOOR_ORDER_TIME = (5 * WEEK).toLong()
val BRICK_TIME = (2 * WEEK).toLong()
val INSTALL_WINDOW_TIME = (0.5 * WEEK).toLong()
val INSTALL_DOOR_TIME = (0.5 * WEEK).toLong()

class Builder {
    fun buildHouse(houseName: String) {
        log("starting $houseName")

        val orderWindowsThread = trackedThread("$houseName-order-windows") {
            orderWindows()
        }

        val orderDoorsThread = trackedThread("$houseName-order-doors") {
            orderDoors()
        }

        val stackBrickThread = trackedThread("$houseName-stack-brick") {
            stackBrick()
        }

        orderWindowsThread.join()
        orderDoorsThread.join()
        stackBrickThread.join()

        installWindow()
        installDoor()
        log("completed $houseName")
    }

    fun orderWindows() {
        log("ordering windows")
        Thread.sleep(WINDOW_ORDER_TIME)
        log("ordered windows completed")
    }

    fun orderDoors() {
        log("ordering doors")
        Thread.sleep(DOOR_ORDER_TIME)
        log("ordered doors completed")
    }

    fun stackBrick() {
        log("laying brick")
        Thread.sleep(BRICK_TIME)
        log("stack brick completed")
    }

    fun installWindow() {
        log("installing window")
        Thread.sleep(INSTALL_WINDOW_TIME)
        log("installed window completed")
    }

    fun installDoor() {
        log("installing door")
        Thread.sleep(INSTALL_DOOR_TIME)
        log("installed door completed")
    }
}

const val HOUSE_COUNT = 100
const val BUILDER_COUNT = 100

class ConstructionCompany {
    fun buildHouses() {
        val builderThreads = (1..BUILDER_COUNT).map { builderNumber ->
            val builder = Builder()

            trackedThread("builder-$builderNumber-thread") {
                buildAssignedHouses(builderNumber, builder)
            }
        }

        builderThreads.forEach { builderThread ->
            builderThread.join()
        }
    }

    private fun buildAssignedHouses(builderNumber: Int, builder: Builder) {
        val assignedHouses = (1..HOUSE_COUNT).filter { houseNumber ->
            (houseNumber - 1) % BUILDER_COUNT == builderNumber - 1
        }

        log("builder $builderNumber started assigned houses $assignedHouses")

        assignedHouses.forEach { houseNumber ->
            builder.buildHouse("house $houseNumber")
        }

        log("builder $builderNumber completed assigned houses $assignedHouses")
    }
}

fun main() {
    val company = ConstructionCompany()

    runTrackedMain("Construction company") {
        company.buildHouses()
    }
}