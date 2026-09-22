plugins {
    kotlin("multiplatform") version "1.9.23"
}

group = "com.codinglombok"
version = "0.1.0"

kotlin {
    jvm {
        compilations.all { kotlinOptions.jvmTarget = "17" }
        withJava()
    }
    js(IR) { browser(); nodejs() }
    iosArm64(); iosSimulatorArm64(); macosArm64(); macosX64()
    linuxX64(); mingwX64()
    wasmJs { browser(); nodejs() }

    sourceSets {
        val commonMain by getting { dependencies {} }
        val commonTest by getting { dependencies { implementation(kotlin("test")) } }
        val jvmMain by getting
    }
}
