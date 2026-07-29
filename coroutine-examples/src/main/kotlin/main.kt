import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.coroutineScope
import java.time.LocalTime
import java.time.LocalTime.*
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeFormatter.*
import java.util.stream.Stream
import kotlin.concurrent.thread
import kotlin.coroutines.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.joinAll
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

val timeFormat = ofPattern("HH:mm:ss.SSS")

fun log(message: String) {
    println("${now().format(timeFormat)} | $message")
}

//fun main() {
//    log("Main starts on ${Thread.currentThread().name}")
//
//    val workerA = thread(name = "worker-a") {
//        repeat(3) { step ->
//            log("Worker A step ${step + 1} on ${Thread.currentThread().name}")
//            Thread.sleep(300)
//        }
//    }
//
//    val workerB = thread(name = "worker-b") {
//        repeat(3) { step ->
//            log("Worker B step ${step + 1} on ${Thread.currentThread().name}")
//            Thread.sleep(300)
//        }
//    }
//
//    workerA.join()
//    workerB.join()
//
//    log("Main finishes after both threads complete")
//}



fun main() = runBlocking{

    log("stat")
    log("Worker  ${Thread.currentThread().name}")

    val bobCompany = SmartCompany()
    bobCompany.contarct(4)

//    val bob = Builder()
//    bob.build()
    log("end")

}

class Builder{
     suspend fun stackBrick() {
        log("stack brick placed")
        Thread.sleep(2000)
        log("stack brick completed")
    }

     suspend fun intallWindow(){
        log("installing window")
        Thread.sleep(500)
        log("installed window completed")
    }

     suspend fun installDoor(){
        log("installing door")
        Thread.sleep(500)
        log("installed door completed")
    }
}


class SmartBuyer{

    suspend fun orderWindow(): Unit {

        log("order window placed")
        delay(10000) //doing work
        log("order window completed")
    }


    suspend fun orderDoor(): Unit {

        log("order door placed")
        delay(10000)
        log("order door completed")
    }
}


class SmartCompany{
    private val buyer = SmartBuyer() //
    private val builders = listOf<Builder>(
        Builder(), // pooja
        Builder() // mittal
    )

    suspend fun contarct(forHouses: Int)= coroutineScope{

        for(i in 1..if(forHouses/builders.size< 1) 1 else forHouses/builders.size){

            val builderThreads = mutableListOf<Job>()
            builders.forEach { builder ->
                builderThreads.add(launch(Dispatchers.Default) {
                    build()
                })

            }

            builderThreads.joinAll()
        }
    }


    suspend fun build()= coroutineScope {
        val buyer =  SmartBuyer()
        val builder = Builder()


        val orderWindowJob = launch {
            buyer.orderWindow()
        }
        val orderDoorJob = launch {
            buyer.orderDoor()
        }

        val stackBrickJob = launch {
            builder.stackBrick()
        }
        orderWindowJob.join()
        orderDoorJob.join()
        stackBrickJob.join()

        builder.intallWindow()
        builder.installDoor()
    }
}