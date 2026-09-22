cmake_minimum_required(VERSION 3.20)
project(LombokAlgoritma VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Header-only library target
add_library(lombokalgoritma INTERFACE)
target_include_directories(lombokalgoritma INTERFACE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/ports/cpp/include>
    $<INSTALL_INTERFACE:include>
)
target_compile_features(lombokalgoritma INTERFACE cxx_std_20)
if(MSVC)
    target_compile_options(lombokalgoritma INTERFACE /W4 /WX)
else()
    target_compile_options(lombokalgoritma INTERFACE -Wall -Wextra -Wpedantic -Werror)
endif()

# Tests
if(BUILD_TESTING)
    enable_testing()
    find_package(Catch2 3 QUIET)
    if(Catch2_FOUND)
        add_executable(tests ports/cpp/tests/test_sort.cpp)
        target_link_libraries(tests PRIVATE lombokalgoritma Catch2::Catch2WithMain)
        add_test(NAME unit_tests COMMAND tests)
    endif()
endif()

# Installation
install(TARGETS lombokalgoritma EXPORT LombokAlgoritmaTargets)
install(DIRECTORY ports/cpp/include/ DESTINATION include)
install(EXPORT LombokAlgoritmaTargets
    FILE LombokAlgoritmaTargets.cmake
    NAMESPACE CodingLombok::
    DESTINATION lib/cmake/LombokAlgoritma
)
