cmake_minimum_required(VERSION 3.25)
project("pd4web")

# Pd sources
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -pthread -matomics -mbulk-memory")
include("${CMAKE_CURRENT_SOURCE_DIR}/Pd4Web/libpd.cmake")
include("${CMAKE_CURRENT_SOURCE_DIR}/Pd4Web/Externals/pd.cmake")
set(PDCMAKE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/Pd4Web/Externals/" CACHE STRING "" FORCE)
set(PD4WEB_EXTERNAL_DIR "${CMAKE_CURRENT_SOURCE_DIR}/Pd4Web/Externals/" CACHE STRING "" FORCE)
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/Pd4Web/pure-data/src")
add_definitions(-DPDTHREADS)

if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    message(WARNING "Building in Debug mode")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -g")
else()
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}  -O3 -flto -pthread -matomics -mbulk-memory -msimd128")
    set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -flto -pthread -matomics -mbulk-memory -msimd128")
endif()

# Pd4Web executable
add_executable(pd4web Pd4Web/pd4web.cpp Pd4Web/externals.cpp)
target_include_directories(pd4web PRIVATE Pd4Web/pure-data/src)
target_link_libraries(pd4web PRIVATE
    embind
    libpd
)
set_target_properties(pd4web PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/WebPatch"
)
target_link_options(pd4web PRIVATE
    -sMODULARIZE=1
    -sEXPORT_NAME='Pd4WebModule'
    -sINITIAL_MEMORY=32MB
    -sUSE_PTHREADS=1
    -sPTHREAD_POOL_SIZE=4
    -sWASMFS=1
    -sWASM=1
    -sWASM_WORKERS=1
    -sAUDIO_WORKLET=1
)

# FileSystem for the Patch
set_target_properties(pd4web PROPERTIES LINK_FLAGS "--preload-file \"${CMAKE_CURRENT_SOURCE_DIR}/WebPatch/index.pd@/index.pd\"")
