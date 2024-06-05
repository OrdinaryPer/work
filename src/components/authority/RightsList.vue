<template>
  <div>
    <main-nav>
      <template v-slot:otherBreadcrumb>
        <nav-item>权限管理</nav-item>
        <nav-item>权限列表</nav-item>
      </template>
    </main-nav>
    <el-card>
      <el-table
        :data="rightsList"
        :border="true"
        :stripe="true">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="ps_name"></el-table-column>
        <el-table-column label="路径" prop="ps_api_path"></el-table-column>
        <el-table-column label="权限等级" prop="ps_level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.ps_level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.ps_level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import MainNav from '@/components/navigation/MainNav'
import NavItem from '@/components/navigation/NavItem'

export default {
  data() {
    return {
      rightsList: []
    }
  },

  created() {
    this.getRightsList()
  },

  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
    }
  },

  components: {
    MainNav,
    NavItem
  }
}
</script>

<style lang="less" scoped>
</style>
