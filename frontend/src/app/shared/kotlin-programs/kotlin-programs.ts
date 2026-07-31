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

export interface BuilderTimingConfig {
  weekMillis: number;
  windowOrderWeeks: number;
  doorOrderWeeks: number;
  brickWeeks: number;
  installWindowWeeks: number;
  installDoorWeeks: number;
}

export interface ConstructionCompanyConfig {
  houseCount: number;
  builderCount: number;
}

export interface BuilderProgramConfig {
  timing: BuilderTimingConfig;
  company: ConstructionCompanyConfig;
}

export const DEFAULT_BUILDER_TIMING_CONFIG: BuilderTimingConfig = {
  weekMillis: 1000,
  windowOrderWeeks: 5,
  doorOrderWeeks: 5,
  brickWeeks: 2,
  installWindowWeeks: 0.5,
  installDoorWeeks: 0.5
};

export const DEFAULT_CONSTRUCTION_COMPANY_CONFIG: ConstructionCompanyConfig = {
  houseCount: 10,
  builderCount: 2
};

export const DEFAULT_BUILDER_PROGRAM_CONFIG: BuilderProgramConfig = {
  timing: DEFAULT_BUILDER_TIMING_CONFIG,
  company: DEFAULT_CONSTRUCTION_COMPANY_CONFIG
};

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
        private var runningThreadCount = 0
        private var maxRunningThreadCount = 0

        @Synchronized
        fun markThreadStarted() {
            val threadName = Thread.currentThread().name
            val now = System.currentTimeMillis()

            val isNewThread = !threadTimings.containsKey(threadName)

            threadTimings.getOrPut(threadName) {
                ThreadTiming(
                    name = threadName,
                    startedAt = now,
                    lastSeenAt = now
                )
            }

            if (isNewThread) {
                runningThreadCount += 1
                if (runningThreadCount > maxRunningThreadCount) {
                    maxRunningThreadCount = runningThreadCount
                }
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
            val timing = threadTimings[Thread.currentThread().name]

            if (timing?.finishedAt == null) {
                timing?.finishedAt = System.currentTimeMillis()
                runningThreadCount -= 1
            }
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

        @Synchronized
        fun getMaxRunningThreadCount(): Int = maxRunningThreadCount
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
    val maxRunningThreads = ThreadNameStore.getMaxRunningThreadCount()

    println()
    println("========== $label summary ==========")
    println("Total time    : $elapsedMillis ms")
    println("Total threads : \${threadTimings.size}")
    println("Max running   : $maxRunningThreads")
    println("Thread timings:")
    threadTimings.forEach { timing ->
        println("  - \${timing.name}: \${timing.livedForMillis} ms")
    }
    println("======================================")
}`;

export function buildBuilderCode(config: BuilderTimingConfig = DEFAULT_BUILDER_TIMING_CONFIG): string {
  return `const val WEEK = ${config.weekMillis}L

val WINDOW_ORDER_TIME = (${config.windowOrderWeeks} * WEEK).toLong()
val DOOR_ORDER_TIME = (${config.doorOrderWeeks} * WEEK).toLong()
val BRICK_TIME = (${config.brickWeeks} * WEEK).toLong()
val INSTALL_WINDOW_TIME = (${config.installWindowWeeks} * WEEK).toLong()
val INSTALL_DOOR_TIME = (${config.installDoorWeeks} * WEEK).toLong()

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
}`;
}

export const BUILDER_CODE = buildBuilderCode();

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

export function buildConstructionCompanyCode(config: ConstructionCompanyConfig = DEFAULT_CONSTRUCTION_COMPANY_CONFIG): string {
  const houseCount = Math.max(1, Math.floor(config.houseCount));
  const builderCount = Math.max(1, Math.min(houseCount, Math.floor(config.builderCount)));

  return `const val HOUSE_COUNT = ${houseCount}
const val BUILDER_COUNT = ${builderCount}

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
}`;
}

export const CONSTRUCTION_COMPANY_CODE = buildConstructionCompanyCode();

export const SEQUENTIAL_PROGRAM_CODE = `${COMMON_FUNCTIONS_CODE}

${BUILDER_CODE}

${SEQUENTIAL_MAIN_CODE}`;

export const CONCURRENT_PROGRAM_CODE = `${COMMON_FUNCTIONS_CODE}

${BUILDER_CODE}

${CONCURRENT_MAIN_CODE}`;

export const COMPANY_PROGRAM_CODE = `${COMMON_FUNCTIONS_CODE}

${BUILDER_CODE}

${CONSTRUCTION_COMPANY_CODE}`;

export function buildKotlinProgramCode(
  programId: string,
  config: BuilderProgramConfig = DEFAULT_BUILDER_PROGRAM_CONFIG,
  includeCommonFunctions = true
): string {
  const builderCode = buildBuilderCode(config.timing);
  const buildProgramCode = (programCode: string): string => [
    includeCommonFunctions ? COMMON_FUNCTIONS_CODE : '',
    builderCode,
    programCode
  ].filter(Boolean).join('\n\n');

  if (programId === 'sequential-builder') {
    return buildProgramCode(SEQUENTIAL_MAIN_CODE);
  }

  if (programId === 'concurrent-builder') {
    return buildProgramCode(CONCURRENT_MAIN_CODE);
  }

  if (programId === 'construction-company') {
    return buildProgramCode(buildConstructionCompanyCode(config.company));
  }

  return KOTLIN_PROGRAMS.find((program) => program.id === programId)?.code ?? KOTLIN_PROGRAMS[0].code;
}

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
    description: 'Bob hires builders and runs builder threads for a configurable number of houses.',
    code: COMPANY_PROGRAM_CODE
  }
];
