<template>
  <div>
    <main-nav>
      <template v-slot:otherBreadcrumb>
        <nav-item>权限管理</nav-item>
        <nav-item>角色列表</nav-item>
      </template>
    </main-nav>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary"
            @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="rolesList"
        :border="true"
        :stripe="true">
        <!-- expand 表示折叠行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.ps_id"
              :class="['border-bottom', i1 === 0 ? 'border-top' : '', 'vertical-center']" >
              <!-- 第一列 -->
              <el-col :span="5">
                <el-tag
                  :closable="true"
                  @close="removeRightById(scope.row, item1.ps_id)">
                  {{ item1.ps_name }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 第二列 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.ps_id"
                  :class="[i2 === 0 ? 'border-top' : '', 'vertical-center']">
                  <!-- 2-1 列 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      :closable="true"
                      @close="removeRightById(scope.row, item2.ps_id)">
                      {{ item2.ps_name }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 2-2 列 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="(item3) in item2.children"
                      :key="item3.ps_id"
                      type="warning"
                      :closable="true"
                      @close="removeRightById(scope.row, item3.ps_id)">
                      {{ item3.ps_name }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="role_name"></el-table-column>
        <el-table-column label="角色描述" prop="role_desc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showUpdateRoleDialog(scope.row)">修改</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRole(scope.row)">删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="ps_id"
        default-expand-all
        :default-checked-keys="selectedNode"
        ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRight">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed">
      <el-form :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="90px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="addRoleForm.role_name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="role_desc">
          <el-input v-model="addRoleForm.role_desc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 更新角色信息对话框 -->
    <el-dialog title="修改角色"
      :visible.sync="updateRoleDialogVisible"
      width="50%"
      @close="updateRoleDialogClosed">
      <el-form :model="updateRoleInfo"
        :rules="addRoleFormRules"
        ref="updateRoleFormRef"
        label-width="9
        0px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="updateRoleInfo.role_name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="role_desc">
          <el-input v-model="updateRoleInfo.role_desc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updateRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRole">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MainNav from '@/components/navigation/MainNav'
import NavItem from '@/components/navigation/NavItem'

export default {
  data() {
    return {
      rolesList: [],
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        label: 'ps_name',
        children: 'children'
      },
      selectedNode: [],
      roleId: '',
      addRoleDialogVisible: false,
      addRoleForm: {
        role_name: '',
        role_desc: ''
      },
      addRoleFormRules: {
        role_name: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 7,
            message: '角色名称的长度在 2 ~ 7 个字符之间',
            trigger: 'blur'
          }
        ],
        role_desc: {
          required: false,
          message: '请输入角色描述',
          trigger: 'blur'
        }
      },
      updateRoleDialogVisible: false,
      updateRoleInfo: {}
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
      // console.log(res)
    },

    async removeRightById(role, rightId) {
      const result = await this.$confirm('是否删除该权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(err => err)
        .catch(() => {})
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
      this.roleId = role.role_id
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限信息失败')
      }
      this.rightsList = res.data
      console.log(role)
      if (role.children) {
        for (const e of role.children) {
          this.selectedNode.push(e.ps_id)
          if (e.children) {
            for (const a of e.children) {
              this.selectedNode.push(a.ps_id)
            }
          }
        }
      }
      // this.getRightNode(role, this.selectedNode)
      // console.log(this.selectedNode)
      this.setRightDialogVisible = true
    },

    getRightNode(node, arr) {
      if (!node.children) {
        return arr.push(node.ps_id)
      }
      node.children.forEach(e => this.getRightNode(e, arr))
    },

    setRightDialogClosed() {
      this.selectedNode = []
    },

    async allocateRight() {
      let keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      keys = Array.from(new Set(keys))
      console.log(keys)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,
        { ps_ids: keys.join(',') })
      if (res.meta.status !== 200) {
        return this.$message.error('修改权限失败')
      }
      this.getRolesList()
      this.setRightDialogVisible = false
      this.$message.success('修改权限成功')
    },

    async addRole() {
      console.info(this.addRoleForm)
      const { data: res } = await this.$http.post('roles', this.addRoleForm)
      if (res.meta.status !== 200) {
        return this.$message.error('添加角色失败')
      }
      this.getRolesList()
      this.addRoleDialogVisible = false
      this.$message.success('添加角色成功')
    },

    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },

    async showUpdateRoleDialog(role) {
      const id = role.role_id
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error('请求角色信息失败')
      }
      this.updateRoleInfo = res.data
      this.updateRoleDialogVisible = true
    },

    updateRoleDialogClosed() {
      this.$refs.updateRoleFormRef.resetFields()
    },

    async updateRole() {
      // console.info(this.updateRoleInfo)
      const { data: res } = await this.$http
        .put(`roles/${this.updateRoleInfo.role_id}`,
          this.updateRoleInfo)
      if (res.meta.status !== 200) {
        this.$message.error('修改角色信息失败')
      }
      this.getRolesList()
      this.updateRoleDialogVisible = false
      this.$message.success('修改角色信息成功')
    },

    async deleteRole(role) {
      const { data: res } = await this.$http.delete(`roles/${role.role_id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      this.getRolesList()
      this.$message.success(res.meta.msg)
    }
  },

  components: {
    MainNav,
    NavItem
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
