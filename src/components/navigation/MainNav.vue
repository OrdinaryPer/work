<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <slot name="otherBreadcrumb">
    </slot>
  </el-breadcrumb>
</template>

<script>

export default {
  name: 'MainNav'
}
</script>

<style>
</style>
