<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" :border="true" :stripe="true">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children"
                    :key="item1.id"
                    :class="['border-bottom', i1 === 0 ? 'border-top' : '', 'vertical-center']" >
              <el-col :span="5">
                <el-tag :closable="true"
                        @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children"
                        :key="item2.id"
                        :class="[i2 === 0 ? 'border-top' : '', 'vertical-center']">
                  <el-col :span="6">
                    <el-tag type="success"
                            :closable="true"
                            @close="removeRightById(scope.row, item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3) in item2.children"
                            :key="item3.id"
                            type="warning"
                            :closable="true"
                            @close="removeRightById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini">修改</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini">删除</el-button>
            <el-button type="warning"
                       icon="el-icon-setting"
                       size="mini"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 对话框 -->
    <el-dialog
    title="分配权限"
    :visible.sync="setRightDialogVisible"
    width="50%"
    @close="setRightDialogClosed">
    <el-tree :data="rightsList"
             :props="treeProps"
             show-checkbox
             node-key="id"
             default-expand-all
             :default-checked-keys="selectedNode"
             ref="treeRef">
    </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      selectedNode: [],
      roleId: ''
    }
  },

  created() {
    this.getRolesList()
  },

  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },

    async removeRightById(role, rightId) {
      const result = await this.$confirm(', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(err => err)
      if (result !== 'confirm') {
        return
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      role.children = res.data
      this.$message.success('删除成功')
    },

    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限信息失败')
      }
      this.rightsList = res.data
      this.getRightNode(role, this.selectedNode)
      this.setRightDialogVisible = true
    },

    getRightNode(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(e => this.getRightNode(e, arr))
    },

    setRightDialogClosed() {
      this.selectedNode = []
    },

    async allocateRight() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,
        { rids: keys.join(',') })
      if (res.meta.status !== 200) {
        return this.$message.error('修改权限失败')
      }
      this.getRolesList()
      this.setRightDialogVisible = false
      this.$message.success('修改权限成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.border-top {
  border: 1px solid #eee;
}

.border-bottom {
  border: 1px solid #eee;
}

.vertical-center {
  display: flex;
  align-items: center;
}
</style>
