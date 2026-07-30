export interface KotlinProgram {
  id: string;
  groupId: string;
  label: string;
  description: string;
  code: string;
}

export interface KotlinProgramGroup {
  id: string;
  label: string;
  description: string;
}

export const KOTLIN_PROGRAM_GROUPS: KotlinProgramGroup[] = [
  {
    id: 'basics',
    label: 'Basics',
    description: 'Small starter programs for checking the Kotlin playground.'
  },
  {
    id: 'sequential-vs-concurrent',
    label: 'Sequential VS Concurrent',
    description: 'Programs from the Bob builder scenarios.'
  }
];

export const COMMON_FUNCTIONS_CODE = `data class ThreadTiming(
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
    println("Total threads : \${threadTimings.size}")
    println("Thread timings:")
    threadTimings.forEach { timing ->
        println("  - \${timing.name}: \${timing.livedForMillis} ms")
    }
    println("======================================")
}`;

export const BUILDER_CODE = `const val WEEK = 1000L
const val HALF_WEEK = WEEK / 2
const val SUPPLIER_ORDER_TIME = 5 * WEEK

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
        Thread.sleep(SUPPLIER_ORDER_TIME)
        log("ordered windows completed")
    }

    fun orderDoors() {
        log("ordering doors")
        Thread.sleep(SUPPLIER_ORDER_TIME)
        log("ordered doors completed")
    }

    fun stackBrick() {
        log("laying brick")
        Thread.sleep(2 * WEEK)
        log("stack brick completed")
    }

    fun installWindow() {
        log("installing window")
        Thread.sleep(HALF_WEEK)
        log("installed window completed")
    }

    fun installDoor() {
        log("installing door")
        Thread.sleep(HALF_WEEK)
        log("installed door completed")
    }
}`;

export const SEQUENTIAL_MAIN_CODE = `fun main() {
    val builder = Builder()

    runTrackedMain("Sequential") {
        builder.orderWindows()
        builder.orderDoors()
        builder.stackBrick()
        builder.installWindow()
        builder.installDoor()
    }
}`;

export const CONCURRENT_MAIN_CODE = `fun main() {
    val builder = Builder()

    runTrackedMain("Concurrent") {
        val orderWindowsThread = trackedThread("order-windows") {
            builder.orderWindows()
        }

        val orderDoorsThread = trackedThread("order-doors") {
            builder.orderDoors()
        }

        val stackBrickThread = trackedThread("stack-brick") {
            builder.stackBrick()
        }

        orderWindowsThread.join()
        orderDoorsThread.join()
        stackBrickThread.join()

        builder.installWindow()
        builder.installDoor()
    }
}`;

export const CONSTRUCTION_COMPANY_CODE = `class ConstructionCompany(
    private val builderOne: Builder = Builder(),
    private val builderTwo: Builder = Builder()
) {
    fun buildTenHouses() {
        val builderOneThread = trackedThread("builder-1-thread") {
            buildAssignedHouses("builder 1", builderOne, 1..5)
        }

        val builderTwoThread = trackedThread("builder-2-thread") {
            buildAssignedHouses("builder 2", builderTwo, 6..10)
        }

        builderOneThread.join()
        builderTwoThread.join()
    }

    private fun buildAssignedHouses(builderName: String, builder: Builder, houseNumbers: IntRange) {
        log("$builderName started assigned houses $houseNumbers")

        houseNumbers.forEach { houseNumber ->
            builder.buildHouse("house $houseNumber")
        }

        log("$builderName completed assigned houses $houseNumbers")
    }
}

fun main() {
    val company = ConstructionCompany()

    runTrackedMain("Construction company") {
        company.buildTenHouses()
    }
}`;

export const SEQUENTIAL_PROGRAM_CODE = `${COMMON_FUNCTIONS_CODE}

${BUILDER_CODE}

${SEQUENTIAL_MAIN_CODE}`;

export const CONCURRENT_PROGRAM_CODE = `${COMMON_FUNCTIONS_CODE}

${BUILDER_CODE}

${CONCURRENT_MAIN_CODE}`;

export const COMPANY_PROGRAM_CODE = `${COMMON_FUNCTIONS_CODE}

${BUILDER_CODE}

${CONSTRUCTION_COMPANY_CODE}`;

export const KOTLIN_PROGRAMS: KotlinProgram[] = [
  {
    id: 'hello-world',
    groupId: 'basics',
    label: 'Hello world',
    description: 'A tiny starter program for checking the Kotlin playground.',
    code: `fun main() {
    println("Hello, world!")
}`
  },
  {
    id: 'sequential-builder',
    groupId: 'sequential-vs-concurrent',
    label: 'Sequential builder',
    description: 'Bob builds one house by running every step one after another.',
    code: SEQUENTIAL_PROGRAM_CODE
  },
  {
    id: 'concurrent-builder',
    groupId: 'sequential-vs-concurrent',
    label: 'Concurrent builder',
    description: 'Bob overlaps supplier orders and brick work with explicit threads.',
    code: CONCURRENT_PROGRAM_CODE
  },
  {
    id: 'construction-company',
    groupId: 'sequential-vs-concurrent',
    label: 'Construction company',
    description: 'Bob hires two builders and runs two builder threads for 10 houses.',
    code: COMPANY_PROGRAM_CODE
  }
];
