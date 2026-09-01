import java.util.zip.ZipInputStream

pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "HeroLife"

include(":app")
include(":core:model")

/*
 * HeroLife ZIP Module Loader
 *
 * Drop future independent module ZIP files into:
 *   module-zips/
 *
 * Each ZIP must contain:
 *   herolife-module.json
 *   <module folder(s)>
 *
 * Example manifest:
 * {
 *   "gradlePath": ":feature:designsystem",
 *   "projectDir": "feature/designsystem"
 * }
 *
 * During Gradle settings evaluation, archives are extracted into:
 *   .generated-modules/<zip-name>/
 *
 * Then the module is automatically included in the Gradle build.
 */

data class ModuleManifest(
    val gradlePath: String,
    val projectDir: String
)

fun unzip(zipFile: File, destination: File) {
    if (destination.exists()) destination.deleteRecursively()
    destination.mkdirs()

    ZipInputStream(zipFile.inputStream().buffered()).use { zis ->
        var entry = zis.nextEntry
        while (entry != null) {
            val out = File(destination, entry.name).canonicalFile
            require(out.path.startsWith(destination.canonicalPath + File.separator)) {
                "Unsafe ZIP entry: ${entry.name}"
            }

            if (entry.isDirectory) {
                out.mkdirs()
            } else {
                out.parentFile?.mkdirs()
                out.outputStream().buffered().use { output ->
                    zis.copyTo(output)
                }
            }
            zis.closeEntry()
            entry = zis.nextEntry
        }
    }
}

fun parseManifest(file: File): ModuleManifest {
    val text = file.readText()

    fun valueOf(key: String): String {
        val regex = Regex("\"$key\"\\s*:\\s*\"([^\"]+)\"")
        return regex.find(text)?.groupValues?.get(1)
            ?: error("Missing '$key' in ${file.path}")
    }

    return ModuleManifest(
        gradlePath = valueOf("gradlePath"),
        projectDir = valueOf("projectDir")
    )
}

val moduleZipDir = file("module-zips")
val generatedModulesDir = file(".generated-modules")
generatedModulesDir.mkdirs()

moduleZipDir
    .listFiles { file -> file.isFile && file.extension.equals("zip", ignoreCase = true) }
    ?.sortedBy { it.name }
    ?.forEach { zip ->
        val extractDir = File(generatedModulesDir, zip.nameWithoutExtension)
        val marker = File(extractDir, ".source-sha256")

        val digest = java.security.MessageDigest.getInstance("SHA-256")
        val hash = zip.inputStream().use { input ->
            val buffer = ByteArray(8192)
            while (true) {
                val read = input.read(buffer)
                if (read <= 0) break
                digest.update(buffer, 0, read)
            }
            digest.digest().joinToString("") { "%02x".format(it) }
        }

        if (!marker.exists() || marker.readText() != hash) {
            unzip(zip, extractDir)
            marker.writeText(hash)
        }

        val manifestFile = File(extractDir, "herolife-module.json")
        require(manifestFile.exists()) {
            "Module ZIP '${zip.name}' has no herolife-module.json"
        }

        val manifest = parseManifest(manifestFile)
        val dir = File(extractDir, manifest.projectDir)

        require(dir.exists()) {
            "Module directory '${manifest.projectDir}' not found in ${zip.name}"
        }

        include(manifest.gradlePath)
        project(manifest.gradlePath).projectDir = dir

        println("HeroLife Module Loader: loaded ${manifest.gradlePath} from ${zip.name}")
    }
