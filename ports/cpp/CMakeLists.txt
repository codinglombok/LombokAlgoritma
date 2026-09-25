# LombokAlgoritma — C++20 header-only port
# SPDX-License-Identifier: Apache-2.0 OR MIT
cmake_minimum_required(VERSION 3.20)
project(LombokAlgoritmaCpp VERSION 0.1.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(lombokalgoritma INTERFACE)
add_library(CodingLombok::lombokalgoritma ALIAS lombokalgoritma)
target_include_directories(lombokalgoritma INTERFACE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>)
target_compile_features(lombokalgoritma INTERFACE cxx_std_20)

include(CTest)
if(BUILD_TESTING)
    include(FetchContent)
    FetchContent_Declare(Catch2
        GIT_REPOSITORY https://github.com/catchorg/Catch2.git
        GIT_TAG        v3.7.1)
    FetchContent_MakeAvailable(Catch2)
    # Two translation units: also proves the headers are ODR-safe (inline functions).
    add_executable(lombokalgoritma_tests tests/test_sort.cpp tests/test_all.cpp)
    target_link_libraries(lombokalgoritma_tests PRIVATE lombokalgoritma Catch2::Catch2WithMain)
    if(MSVC)
        target_compile_options(lombokalgoritma_tests PRIVATE /W4 /WX)
    else()
        target_compile_options(lombokalgoritma_tests PRIVATE -Wall -Wextra -Wpedantic -Werror)
    endif()
    include(Catch)
    catch_discover_tests(lombokalgoritma_tests)
endif()

include(GNUInstallDirs)
install(TARGETS lombokalgoritma EXPORT LombokAlgoritmaTargets)
install(DIRECTORY include/ DESTINATION ${CMAKE_INSTALL_INCLUDEDIR})
install(EXPORT LombokAlgoritmaTargets
    FILE LombokAlgoritmaTargets.cmake
    NAMESPACE CodingLombok::
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/LombokAlgoritma)
