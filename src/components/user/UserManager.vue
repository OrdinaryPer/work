<template>
  <div>
  <main-nav>
    <template v-slot:otherBreadcrumb>
      <nav-item>活动管理</nav-item>
      <nav-item>活动列表</nav-item>
      <nav-item>活动详情</nav-item>
    </template>
  </main-nav>
  <el-card>
    <!-- gutter 栅格间隔 -->
    <el-row :gutter="20">
      <!-- span 栅格占据的列数 -->
      <el-col :span="8">
        <!--
          clearable 是否可清空
          @clear 在点击由 clearable 属性生成的清空按钮时触发
        -->
        <el-input
          v-model="queryInfo.query"
          placeholder="请输入内容"
          :clearable="true"
          @clear="getUserList">
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="getUserList">
          </el-button>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button
          type="primary"
          @click="addDialogVisible = true">添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 用户列表区域 -->
    <!--
      border 是否带有纵向边框
      stripe 是否为斑马纹 table
     -->
    <el-table
      :data="userList"
      :border="true"
      :stripe="true">
      <!--
        type 对应列的类型。如果设置了 selection 则显示多选框；
          如果设置了 index 则显示该行的索引（从 1 开始计算）；
          如果设置了 expand 则显示为一个可展开的按钮
        label 显示的标题
       -->
      <el-table-column type="index"></el-table-column>
      <el-table-column label="姓名" prop="mg_name"></el-table-column>
      <el-table-column label="邮箱" prop="mg_email"></el-table-column>
      <el-table-column label="电话" prop="mg_mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态">
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.mg_state"
            @change="userStateChanged(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.mg_id)"></el-button>
          <!-- 删除按钮 -->
          <el-button type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeUserById(scope.row.mg_id)"></el-button>
          <!--
            文字提示
            effect 默认提供的主题
            content 显示的内容，也可以通过 slot#content 传入 DOM
            placement Tooltip 的出现位置
            enterable 鼠标是否可进入到 tooltip 中
           -->
          <el-tooltip effect="dark"
            content="分配角色"
            placement="top"
            :enterable="false">
            <el-button type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRole(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--
      列表底部导航栏
      @size-change pageSize 改变时会触发
      @current-change currentPage 改变时会触发
      current-page 当前页数，支持 .sync 修饰符
      page-sizes 每页显示个数选择器的选项设置
      page-size 每页显示条目个数，支持 .sync 修饰符
      layout 组件布局，子组件名用逗号分隔
      total 总条目数
    -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="userTotal">
    </el-pagination>
  </el-card>

  <!-- 添加用户对话框 -->
  <!--
    title Dialog 的标题，也可通过具名 slot 传入
    visible.sync 是否显示 Dialog，支持 .sync 修饰符
   -->
  <el-dialog
    title="添加用户"
    :visible.sync="addDialogVisible"
    width="50%"
    @close="addDialogClosed">
    <el-form
      :model="addForm"
      :rules="addFormRules"
      ref="addFormRef"
      label-width="70px">
    <el-form-item label="用户名" prop="mg_name">
      <el-input v-model="addForm.mg_name"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="mg_pwd">
      <el-input v-model="addForm.mg_pwd"></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="mg_email">
      <el-input v-model="addForm.mg_email"></el-input>
    </el-form-item>
    <el-form-item label="手机" prop="mg_mobile">
      <el-input v-model="addForm.mg_mobile"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
</el-dialog>

<!-- 修改用户对话框 -->
<el-dialog
  title="修改用户"
  :visible.sync="editDialogVisible"
  width="50%"
  @close="editDialogClosed">
  <el-form
    :model="editForm"
    :rules="editFormRules"
    ref="editFormRef"
    label-width="70px">
    <el-form-item label="用户名">
      <el-input v-model="editForm.mg_name" disabled></el-input>
    </el-form-item>
    <el-form-item label="邮箱" prop="mg_email">
      <el-input v-model="editForm.mg_email"></el-input>
    </el-form-item>
    <el-form-item label="手机" prop="mg_mobile">
      <el-input v-model="editForm.mg_mobile"></el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUser">确 定</el-button>
  </span>
</el-dialog>

<!-- 分配角色对话框 -->
<el-dialog
  title="分配角色"
  :visible.sync="setRoleDialogVisible"
  width="50%"
  @close="setRoleDialogClosed">
  <div>
    <p>当前用户：{{ userInfo.mg_name }}</p>
    <p>当前角色：{{ userInfo.role_name }}</p>
    <p>分配新角色：
      <el-select v-model="selectedRoleId" placeholder="请选择">
      <el-option
        v-for="item in rolesList"
        :key="item.role_id"
        :label="item.role_name"
        :value="item.role_id"></el-option>
      </el-select>
    </p>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>

import MainNav from '@/components/navigation/MainNav'
import NavItem from '@/components/navigation/NavItem'
export default {
  data() {
    const checkEmail = (rule, value, cb) => {
      const regEmail =
        /^[a-zA-Z0-9_-]+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    const checkMobile = (rule, value, cb) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      userTotal: 0,
      addDialogVisible: false,
      addForm: {
        mg_name: '',
        mg_pwd: '',
        mg_email: '',
        mg_mobile: ''
      },
      addFormRules: {
        mg_name: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3 ~ 10 个字符之间',
            trigger: 'blur'
          }
        ],
        mg_pwd: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '密码的长度在 6 ~ 15 个字符之间',
            trigger: 'blur'
          }
        ],
        mg_email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mg_mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      // 用于比较用户是否修改
      editSave: '',
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入用户邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入用户手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      setRoleDialogVisible: false,
      userInfo: {},
      rolesList: [],
      selectedRoleId: ''
    }
  },

  created() {
    this.getUserList()
  },

  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('请求用户数据失败')
      }
      // console.log(res.data)
      this.userList = res.data.users
      this.userTotal = res.data.totalpage
      // console.log(this.userList)
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.queryInfo.pagenum = 1
      this.getUserList()
    },

    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    async userStateChanged(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http
        .put(`users/${userInfo.mg_id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('用户状态修改失败')
      }
      this.$message.success('用户状态修改成功')
      // console.log(res)
    },

    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    async addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 200) {
          // console.log(res)
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUserList()
        // console.log(res)
      })
    },

    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editSave = JSON.stringify(this.editForm)
      console.log(res)
      this.editDialogVisible = true
    },

    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    async editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        if (this.editSave === JSON.stringify(this.editForm)) {
          this.editDialogVisible = false
          return
        }
        const { data: res } = await this.$http.put('users/' + this.editForm.mg_id, {
          mg_email: this.editForm.mg_email,
          mg_mobile: this.editForm.mg_mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // console.log(res)
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('用户数据修改成功')
      })
    },
    async removeUserById(id) {
      // 确定返回字符串 confirm
      // 取消则抛出错误，返回 cancel
      const confirmResult = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // console.log(res)
      this.getUserList()
      this.$message.success('删除成功')
    },

    async setRole(userInfo) {
      // console.log(userInfo)
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      console.log(res)
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },

    async saveRoleInfo() {
      // console.log(this.selectedRoleId)
      if (!this.selectedRoleId) {
        return this.$message.error('请选择需要分配的角色')
      }
      const { data: res } = await this.$http
        .put(`users/${this.userInfo.mg_id}/role`, {
          rid: this.selectedRoleId
        })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      // console.log(res)
      this.getUserList()
      this.setRoleDialogVisible = false
      this.$message.success('分配角色成功')
    },

    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
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
