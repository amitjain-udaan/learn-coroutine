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

export interface KotlinProgramCodeParts {
  supportCode: string;
  lessonCode: string;
  fullCode: string;
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
  },
  {
    id: 'sequential-vs-concurrent-coroutine',
    label: 'Sequential VS Concurrent - Coroutine',
    description: 'The same Bob builder scenarios expressed with suspend functions and coroutines.'
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

export const COROUTINE_COMMON_FUNCTIONS_CODE = `import kotlinx.coroutines.CoroutineName
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.joinAll
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import kotlin.coroutines.coroutineContext

class CoroutineActivityStore {
    companion object {
        private val activeCoroutineNames = mutableSetOf<String>()
        private var maxActiveCoroutineCount = 0

        @Synchronized
        fun markActive(name: String) {
            activeCoroutineNames.add(name)

            if (activeCoroutineNames.size > maxActiveCoroutineCount) {
                maxActiveCoroutineCount = activeCoroutineNames.size
            }
        }

        @Synchronized
        fun markSuspended(name: String) {
            activeCoroutineNames.remove(name)
        }

        @Synchronized
        fun getActiveCoroutineCount(): Int = activeCoroutineNames.size

        @Synchronized
        fun getMaxActiveCoroutineCount(): Int = maxActiveCoroutineCount
    }
}

suspend fun currentCoroutineName(): String =
    coroutineContext[CoroutineName]?.name ?: "unnamed"

suspend fun markCoroutineActive() {
    CoroutineActivityStore.markActive(currentCoroutineName())
}

suspend fun markCoroutineSuspended() {
    CoroutineActivityStore.markSuspended(currentCoroutineName())
}

fun getActiveCoroutineCount(): Int =
    CoroutineActivityStore.getActiveCoroutineCount()

fun getMaxActiveCoroutineCount(): Int =
    CoroutineActivityStore.getMaxActiveCoroutineCount()

suspend fun trackedDelay(timeMillis: Long) {
    markCoroutineSuspended()

    try {
        delay(timeMillis)
    } finally {
        markCoroutineActive()
    }
}

suspend fun trackedBlockingSleep(timeMillis: Long) {
    markCoroutineActive()
    Thread.sleep(timeMillis)
}

suspend fun trackedJoinAll(vararg jobs: Job) {
    markCoroutineSuspended()

    try {
        jobs.toList().joinAll()
    } finally {
        markCoroutineActive()
    }
}

suspend fun <T> trackCoroutineWork(block: suspend () -> T): T {
    markCoroutineActive()

    try {
        return block()
    } finally {
        markCoroutineSuspended()
    }
}

suspend fun <T> measureSuspendTime(block: suspend () -> T): Pair<T, Long> {
    val startedAt = System.currentTimeMillis()
    val result = block()
    val finishedAt = System.currentTimeMillis()

    return result to finishedAt - startedAt
}

suspend fun logCoroutine(message: String) {
    markCoroutineActive()

    val time = java.time.LocalTime.now().format(
        java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss.SSS")
    )
    val coroutineName = currentCoroutineName().padEnd(22)
    val threadName = Thread.currentThread().name.padEnd(24)
    val paddedMessage = message.padEnd(80)
    val activeCount = getActiveCoroutineCount()

    println("$time | $coroutineName | $threadName | active=$activeCount | $paddedMessage")
}

fun printCoroutineSummary(label: String, elapsedMillis: Long) {
    println()
    println("========== $label summary ==========")
    println("Total time  : $elapsedMillis ms")
    println("Model       : coroutines")
    println("Active now  : \${getActiveCoroutineCount()}")
    println("Max active  : \${getMaxActiveCoroutineCount()}")
    println("====================================")
}`;

export function buildCoroutineBuilderCode(config: BuilderTimingConfig = DEFAULT_BUILDER_TIMING_CONFIG): string {
  return `const val WEEK = ${config.weekMillis}L

val WINDOW_ORDER_TIME = (${config.windowOrderWeeks} * WEEK).toLong()
val DOOR_ORDER_TIME = (${config.doorOrderWeeks} * WEEK).toLong()
val BRICK_TIME = (${config.brickWeeks} * WEEK).toLong()
val INSTALL_WINDOW_TIME = (${config.installWindowWeeks} * WEEK).toLong()
val INSTALL_DOOR_TIME = (${config.installDoorWeeks} * WEEK).toLong()

class CoroutineBuilder {
    suspend fun buildHouseSequential(houseName: String) {
        trackCoroutineWork {
            logCoroutine("starting $houseName")

            orderWindows()
            orderDoors()
            stackBrick()
            installWindow()
            installDoor()

            logCoroutine("completed $houseName")
        }
    }

    suspend fun buildHouseConcurrent(houseName: String) = coroutineScope {
        trackCoroutineWork {
            logCoroutine("starting $houseName")

            val orderWindowsJob = launch(CoroutineName("$houseName-order-windows")) {
                orderWindows()
            }

            val orderDoorsJob = launch(CoroutineName("$houseName-order-doors")) {
                orderDoors()
            }

            val stackBrickJob = launch(CoroutineName("$houseName-stack-brick")) {
                stackBrick()
            }

            trackedJoinAll(orderWindowsJob, orderDoorsJob, stackBrickJob)

            installWindow()
            installDoor()

            logCoroutine("completed $houseName")
        }
    }

    suspend fun orderWindows() {
        trackCoroutineWork {
            logCoroutine("ordering windows")
            trackedDelay(WINDOW_ORDER_TIME)
            logCoroutine("ordered windows completed")
        }
    }

    suspend fun orderDoors() {
        trackCoroutineWork {
            logCoroutine("ordering doors")
            trackedDelay(DOOR_ORDER_TIME)
            logCoroutine("ordered doors completed")
        }
    }

    suspend fun stackBrick() {
        trackCoroutineWork {
            logCoroutine("laying brick")
            trackedBlockingSleep(BRICK_TIME)
            logCoroutine("stack brick completed")
        }
    }

    suspend fun installWindow() {
        trackCoroutineWork {
            logCoroutine("installing window")
            trackedBlockingSleep(INSTALL_WINDOW_TIME)
            logCoroutine("installed window completed")
        }
    }

    suspend fun installDoor() {
        trackCoroutineWork {
            logCoroutine("installing door")
            trackedBlockingSleep(INSTALL_DOOR_TIME)
            logCoroutine("installed door completed")
        }
    }
}`;
}

export const COROUTINE_SEQUENTIAL_MAIN_CODE = `fun main() = runBlocking(CoroutineName("main")) {
    val builder = CoroutineBuilder()

    val (_, elapsedMillis) = measureSuspendTime {
        builder.buildHouseSequential("coroutine-house")
    }

    printCoroutineSummary("Sequential coroutine", elapsedMillis)
}`;

export const COROUTINE_CONCURRENT_MAIN_CODE = `fun main() = runBlocking(CoroutineName("main")) {
    val builder = CoroutineBuilder()

    val (_, elapsedMillis) = measureSuspendTime {
        builder.buildHouseConcurrent("coroutine-house")
    }

    printCoroutineSummary("Concurrent coroutine", elapsedMillis)
}`;

export const COROUTINE_SEQUENTIAL_PROGRAM_CODE = `${COROUTINE_COMMON_FUNCTIONS_CODE}

${buildCoroutineBuilderCode()}

${COROUTINE_SEQUENTIAL_MAIN_CODE}`;

export const COROUTINE_CONCURRENT_PROGRAM_CODE = `${COROUTINE_COMMON_FUNCTIONS_CODE}

${buildCoroutineBuilderCode()}

${COROUTINE_CONCURRENT_MAIN_CODE}`;

export const STRUCTURED_CONCURRENCY_TRACKING_SUPPORT_CODE = `import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import kotlin.coroutines.CoroutineContext

class TrackingDispatcher(
    private val delegate: CoroutineDispatcher,
    private val tracker: Tracker
) : CoroutineDispatcher() {
    private val timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss.SSS")
    private val startedAt = System.currentTimeMillis()

    override fun dispatch(
        context: CoroutineContext,
        block: Runnable
    ) {
        println(context, HistoryItemStatus.QUEUED, "Queued")

        delegate.dispatch(context) {
            println(context, HistoryItemStatus.RUNNING, "Running")

            block.run()

            println(context, HistoryItemStatus.FINISHED, "Yielded or finished")
        }
    }

    private fun println(
        context: CoroutineContext,
        coroutineStatus: HistoryItemStatus,
        state: String
    ) {
        val historyItem = HistoryItem(
            time = LocalTime.now().format(timeFormatter),
            occurredAtMillis = System.currentTimeMillis() - startedAt,
            thread = Thread.currentThread().name,
            coroutine = context[CoroutineName]?.name ?: "unnamed",
            coroutineStatus = coroutineStatus,
            state = state
        )

        tracker.track(historyItem)
        kotlin.io.println(historyItem.format())
    }
}

class Tracker {
    private val coroutineHistory = linkedMapOf<String, RunnerHistory>()

    @Synchronized
    fun track(historyItem: HistoryItem) {
        val coroutineRunnerHistory = coroutineHistory.getOrPut(historyItem.coroutine) {
            RunnerHistory(
                type = "Coroutine",
                name = historyItem.coroutine,
                markFinishedAsYieldingWhenNextEventComes = true
            )
        }

        coroutineRunnerHistory.track(historyItem)
    }

    @Synchronized
    fun toMap(): Map<String, Map<String, List<HistoryItem>>> =
        mapOf(
            "threadHistory" to threadHistory().toHistoryMap(),
            "coroutineHistory" to coroutineHistory.values.toList().toHistoryMap()
        )

    private fun threadHistory(): List<RunnerHistory> {
        val historiesByThread = linkedMapOf<String, RunnerHistory>()
        val historyItems = coroutineHistory.values
            .flatMap { runnerHistory ->
                runnerHistory.items()
            }
            .sortedBy { historyItem ->
                historyItem.occurredAtMillis
            }

        historyItems.forEach { historyItem ->
            val runnerHistory = historiesByThread.getOrPut(historyItem.thread) {
                RunnerHistory(
                    type = "Thread",
                    name = historyItem.thread,
                    markFinishedAsYieldingWhenNextEventComes = false
                )
            }

            runnerHistory.add(historyItem)
        }

        return historiesByThread.values.toList()
    }

    private fun List<RunnerHistory>.toHistoryMap(): Map<String, List<HistoryItem>> =
        associate { runnerHistory ->
            runnerHistory.name to runnerHistory.items()
        }
}

fun printHistory(histories: Map<String, Map<String, List<HistoryItem>>>) {
    printHistoryGroup(
        title = "Tracked thread history",
        type = "Thread",
        history = histories["threadHistory"].orEmpty()
    )

    printHistoryGroup(
        title = "Tracked coroutine history",
        type = "Coroutine",
        history = histories["coroutineHistory"].orEmpty()
    )
}

fun printHistoryGroup(
    title: String,
    type: String,
    history: Map<String, List<HistoryItem>>
) {
    kotlin.io.println()
    kotlin.io.println(title)

    history.forEach { (name, historyItems) ->
        kotlin.io.println("$type: $name")
        historyItems.forEach { historyItem ->
            kotlin.io.println("  " + historyItem.format())
        }
    }
}

class RunnerHistory(
    val type: String,
    val name: String,
    private val markFinishedAsYieldingWhenNextEventComes: Boolean
) {
    private val history = mutableListOf<HistoryItem>()

    fun track(historyItem: HistoryItem) {
        val previousItem = history.lastOrNull()

        if (previousItem != null) {
            val previousItemWithElapsedTime = previousItem.copy(
                elapsedTime = historyItem.occurredAtMillis - previousItem.occurredAtMillis,
                coroutineStatus = previousItem.nextEventStatus(),
                state = previousItem.nextEventState()
            )
            history[history.lastIndex] = previousItemWithElapsedTime
        }

        history.add(historyItem)
    }

    fun add(historyItem: HistoryItem) {
        history.add(historyItem)
    }

    fun items(): List<HistoryItem> = history.toList()

    private fun HistoryItem.nextEventStatus(): HistoryItemStatus {
        if (!markFinishedAsYieldingWhenNextEventComes) {
            return coroutineStatus
        }

        return when (coroutineStatus) {
            HistoryItemStatus.FINISHED -> HistoryItemStatus.YIELDING
            else -> coroutineStatus
        }
    }

    private fun HistoryItem.nextEventState(): String {
        if (!markFinishedAsYieldingWhenNextEventComes) {
            return state
        }

        return when (coroutineStatus) {
            HistoryItemStatus.FINISHED -> "Yielding"
            else -> state
        }
    }
}

data class HistoryItem(
    val time: String,
    val occurredAtMillis: Long,
    val elapsedTime: Long? = null,
    val thread: String,
    val coroutine: String,
    val coroutineStatus: HistoryItemStatus,
    val state: String
) {
    fun format(): String {
        val stepElapsedTime = "\${elapsedTime ?: 0}ms"

        return "$time | start=\${occurredAtMillis}ms | duration=$stepElapsedTime | $thread | $coroutine | $coroutineStatus | $state"
    }
}

enum class HistoryItemStatus {
    QUEUED,
    RUNNING,
    YIELDING,
    FINISHED
}`;

export function buildStructuredConcurrencyTrackingLessonCode(
  config: BuilderTimingConfig = DEFAULT_BUILDER_TIMING_CONFIG
): string {
  return `const val WEEK = ${config.weekMillis}L
val WINDOW_ORDER_TIME = (${config.windowOrderWeeks} * WEEK).toLong()
val DOOR_ORDER_TIME = (${config.doorOrderWeeks} * WEEK).toLong()
val BRICK_TIME = (${config.brickWeeks} * WEEK).toLong()
val INSTALL_WINDOW_TIME = (${config.installWindowWeeks} * WEEK).toLong()
val INSTALL_DOOR_TIME = (${config.installDoorWeeks} * WEEK).toLong()

class CoroutineBuilder {
    suspend fun buildHouseConcurrent(houseName: String) = coroutineScope {
        val orderWindowsJob = launch(CoroutineName("$houseName-order-windows")) {
            orderWindows()
        }

        val orderDoorsJob = launch(CoroutineName("$houseName-order-doors")) {
            orderDoors()
        }

        val layBrickJob = launch(CoroutineName("$houseName-lay-brick")) {
            layBrick()
        }

        orderWindowsJob.join()
        orderDoorsJob.join()
        layBrickJob.join()
        installDoor()
        installWindow()
    }

    suspend fun orderWindows() {
        delay(WINDOW_ORDER_TIME)
    }

    suspend fun orderDoors() {
        delay(DOOR_ORDER_TIME)
    }

    suspend fun layBrick() {
        Thread.sleep(BRICK_TIME)
    }

    suspend fun installWindow() {
        Thread.sleep(INSTALL_WINDOW_TIME)
    }

    suspend fun installDoor() {
        Thread.sleep(INSTALL_DOOR_TIME)
    }
}

fun main() {
    val histories = runStructuredConcurrencyStep()

    printHistory(histories)
    println()
    println("Returned map keys: " + histories.keys)
}

fun runStructuredConcurrencyStep(): Map<String, Map<String, List<HistoryItem>>> {
    val tracker = Tracker()

    runBlocking(
        context = TrackingDispatcher(Dispatchers.Default, tracker) +
                CoroutineName("Main")
    ) {
        val builder = CoroutineBuilder()
        builder.buildHouseConcurrent("House 1")
    }

    return tracker.toMap()
}`;
}

export function buildStructuredConcurrencyTrackingProgramCode(
  config: BuilderTimingConfig = DEFAULT_BUILDER_TIMING_CONFIG
): string {
  return [
    STRUCTURED_CONCURRENCY_TRACKING_SUPPORT_CODE,
    buildStructuredConcurrencyTrackingLessonCode(config)
  ].join('\n\n');
}

export function buildKotlinProgramCode(
  programId: string,
  config: BuilderProgramConfig = DEFAULT_BUILDER_PROGRAM_CONFIG,
  includeSupportCode = true
): string {
  const codeParts = buildKotlinProgramCodeParts(programId, config);

  return includeSupportCode ? codeParts.fullCode : codeParts.lessonCode;
}

export function buildKotlinProgramCodeParts(
  programId: string,
  config: BuilderProgramConfig = DEFAULT_BUILDER_PROGRAM_CONFIG
): KotlinProgramCodeParts {
  const builderCode = buildBuilderCode(config.timing);
  const buildCodeParts = (supportCode: string, lessonCode: string): KotlinProgramCodeParts => ({
    supportCode,
    lessonCode,
    fullCode: [supportCode, lessonCode].filter(Boolean).join('\n\n')
  });

  if (programId === 'sequential-builder') {
    return buildCodeParts(COMMON_FUNCTIONS_CODE, [builderCode, SEQUENTIAL_MAIN_CODE].join('\n\n'));
  }

  if (programId === 'concurrent-builder') {
    return buildCodeParts(COMMON_FUNCTIONS_CODE, [builderCode, CONCURRENT_MAIN_CODE].join('\n\n'));
  }

  if (programId === 'construction-company') {
    return buildCodeParts(COMMON_FUNCTIONS_CODE, [builderCode, buildConstructionCompanyCode(config.company)].join('\n\n'));
  }

  if (programId === 'sequential-coroutine-builder') {
    return buildCodeParts(COROUTINE_COMMON_FUNCTIONS_CODE, [
      buildCoroutineBuilderCode(config.timing),
      COROUTINE_SEQUENTIAL_MAIN_CODE
    ].join('\n\n'));
  }

  if (programId === 'concurrent-coroutine-builder') {
    return buildCodeParts(
      STRUCTURED_CONCURRENCY_TRACKING_SUPPORT_CODE,
      buildStructuredConcurrencyTrackingLessonCode(config.timing)
    );
  }

  const fallbackProgram = KOTLIN_PROGRAMS.find((program) => program.id === programId) ?? KOTLIN_PROGRAMS[0];

  return buildCodeParts('', fallbackProgram.code);
}

export function buildKotlinProgramSupportCode(
  programId: string,
  config: BuilderProgramConfig = DEFAULT_BUILDER_PROGRAM_CONFIG
): string {
  return buildKotlinProgramCodeParts(programId, config).supportCode;
}

export function buildKotlinProgramLessonCode(
  programId: string,
  config: BuilderProgramConfig = DEFAULT_BUILDER_PROGRAM_CONFIG
): string {
  return buildKotlinProgramCodeParts(programId, config).lessonCode;
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
  },
  {
    id: 'sequential-coroutine-builder',
    groupId: 'sequential-vs-concurrent-coroutine',
    label: 'Sequential coroutine builder',
    description: 'Bob keeps the work sequential, but each waiting step is a suspend function using delay().',
    code: COROUTINE_SEQUENTIAL_PROGRAM_CODE
  },
  {
    id: 'concurrent-coroutine-builder',
    groupId: 'sequential-vs-concurrent-coroutine',
    label: 'Concurrent coroutine builder',
    description: 'Bob overlaps independent work with child coroutines inside coroutineScope.',
    code: buildStructuredConcurrencyTrackingProgramCode()
  }
];
