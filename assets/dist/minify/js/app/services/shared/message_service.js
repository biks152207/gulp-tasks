(function () {
    app.service('message', ['CONSTANT',function (CONSTANT) {

        var self = this;

        self.errorMessages = {

            ACTIVATION_ERROR:{
                title: 'Activation error',
                message: 'Please activate your account by clicking on the link we have sent via email before attempting login.',
                success: false
            },
            CONNECTION_ERROR:{
                title: 'No internet connection',
                message: 'No internet connection detected.<br/> Please check connectivity then try again.',
                success: false
            },
            CONNECTION_REQUIRED:{
                title:  'Internet connection required',
                message:  'Internet connection required.',
                success: false

            },
            DATABASE_ERROR:{
                title: 'Database error',
                message: 'Database Error or no database connection.',
                success: false
            },
            EMAIL_ALREADY_EXISTS:{
                title: 'Email address already exists',
                message: 'The email address submitted already exists. Please use another address then try again.',
                success:false
            },

            EMAIL_ALREADY_VERIFIED:{
                title: 'Email address already verified',
                message: 'Your email address has already been verified and your TodoZu account setup is complete.<br> Please login below using your registered credentials.',
                success:false
            },
            EMAIL_NOT_FOUND: {
                title: 'Email address does not exist',
                message: 'This email address does not match our records.',
                success: false

            },
            EMAIL_NOT_VERIFIED:{
                title: 'Account verification incomplete',
                message: 'Password reset is not authorised until your email address is verified. Please check your email account for the verification link sent. Follow the instructions to verify that you are the owner of this registered email address before trying to reset password.',
                success: false
            },
            EMAIL_REQUIRED:{
                title: 'Email address required',
                message: 'No email address provided.',
                success: false

            },
            GENERAL: {
                title: "Something went wrong",
                message: 'Something went wrong.',
                success: false
            },
            INVALID_TOKEN:{
                title: 'Invalid token',
                message: 'The provided token is invalid or has already expired.',
                success: false
            },
            LOGIN_FAILED_EMAIL_NOT_VERIFIED:{
                title: 'Email not verified',
                message: 'Your email address has not yet been verified.',
                success: false
            },
            LOGIN_FAILED:{
                title: 'Login failed',
                message: 'The email address or password you entered is incorrect.',
                success: false
            },
            MAX_FILE_SIZE_EXCEEDED:{
                title: 'File exceeds maximum size (5MB)',
                message: 'File exceeds maximum size (5MB).',
                success: false
            },
            NO_FILE:{
                title: 'No such file exists',
                message: 'No such file exists.',
                success: false
            },
            PASSWORD_MISMATCH: {
                title: 'Password mismatch',
                message: 'You have provided an incorrect password.',
                success: false
            },
             REMINDER_TIME_REQUIRED: {
                 title: 'Reminder time required',
                 message: 'Reminder time required.',
                 success: false
             },
            REMINDER_TIME_VALIDATION_ERROR_FOR_FIXED: {
                title: 'Reminder time validation error for fixed date time',
                message: 'Time of reminder must be more than 2 minutes from now.',
                success: false
            },
            REMINDER_TIME_VALIDATION_ERROR_FOR_RELATIVE: {
                title: 'Reminder time validation error for relative date time',
                message: 'Reminder must be set to a time in the future.',
                success: false
            },
            USER_NOT_FOUND: {
                title: 'User not found',
                message: 'User not found.',
                success: false

            },
            TASK_NOT_FOUND:{
                title:'Task not found',
                message:'Task not found',
                success:false
            },
            PROJECT_ADMIN_INVITATION_INVALID_PROJECT_USER:{
                title: 'Invalid project user',
                message: 'User with the email is not a valid project user.',
                success: false
            },
            LINK_EXPIRED:{
                title:'Link expired',
                message:'This link has expired.<br/>Please contact the project administrator to arrange for another invitation to be sent.'
            },
            LINK_USED:{
                title:'Link used',
                message:'This link has already been used.<br/>Please contact the project administrator to arrange for another invitation to be sent.'
            },
            INVALID_TOKEN_MSG:{
                title:'Invalid token',
                message:'The token provided is invalid.'
            }


        };

        self.successMessages = {

            ATTACHMENT_ADDED: {
                title: 'Attachment added',
                message: 'Attachment added.',
                success: true
            },
            CONNECTION_ESTABLISHED: {
                title: 'Connection established',
                message: 'Connection established.',
                success: true
            },
            CONFIRM_EMAIL_ADDRESS:{
                title: 'Confirm email address',
                message: 'Almost there! We have sent a confirmation message to your registered email address.<br/> <br/>Click the link in the email to confirm your account registration.',
                success: true
            },
            EMAIL_UPDATED:{
                title: 'Email updated',
                message: 'Email address updated.',
                success: true
            },
            EMAIL_UPDATE_REQUEST: {
                title: 'Please check your new email address and follow the prompts',
                message: 'Please check your new email address and follow the prompts.',
                success: true
            },
            EMAIL_VERIFIED:{
                title: 'Email address verified',
                message: 'Congratulations! Your email address is verified and your TodoZu account setup is complete.<br/><br/> Please login below using your registered credentials.',
                success: true
            },
            FILTER_EDITED: {
                title: 'Filter updated',
                message: 'Filter updated successfully.',
                success: true
            },
            FILTER_DELETED: {
                title: 'Filter deleted',
                message: 'Filter deleted successfully.',
                success: true
            },
            FILTER_SAVED: {
                title: 'Filter saved',
                message: 'Filter saved successfully.',
                success: true
            },
            FORGOT_PASSWORD_EMAIL_SENT:{
                title: 'Email sent (password reset)',
                message: 'An email has been sent with a link to reset your password. Please check your email and follow the instructions.',
                success: true
            },
            LABEL_EDITED: {
                title: 'Label updated',
                message: 'Label updated successfully.',
                success: true
            },
            LABEL_DELETED: {
                title: 'Label deleted',
                message: 'Label deleted successfully.',
                success: true
            },
            LABEL_SAVED: {
                title: 'Label saved',
                message: 'Label saved successfully.',
                success: true
            },
            NAME_UPDATED: {
                title: 'Name updated',
                message: 'Your name has been updated successfully.',
                success: true
            },
            NOTE_COPIED:{
                title: 'Note copied to clipboard',
                message: 'Note copied successfully.',
                success: true
            },
            NOTE_DELETED:{
                title: 'Note deleted',
                message: 'Note deleted successfully.',
                success: true
            },
            NOTE_EDITED:{
                title: 'Note updated',
                message: 'Note updated successfully.',
                success: true
            },
            NOTE_SAVED:{
                title: 'Note saved',
                message: 'Note saved successfully.',
                success: true
            },
            PASSWORD_RESET_REQUEST: {
                title: 'Email sent (password reset)',
                message: 'An email has been sent with a link to reset your password. Please check your email and follow the instructions.',
                success: true
            },
            PASSWORD_UPDATED: {
                title: 'Password updated',
                message: 'Password updated successfully.',
                success: true
            },
            PASSWORD_RESET: {
                title: 'Password reset successful',
                message: 'Congratulations! You have successfully updated your password. Please login below.',
                success: true
            },
            PROFILE_IMAGE_UPDATED:{
                title: 'Profile image updated',
                message: 'Profile image updated.',
                success: true
            },
            PROJECT_ARCHIVED:{
                title: 'Project archived',
                message: 'Project archived successfully.',
                success: true
            },
            PROJECT_DELETED:{
                title: 'Project deleted',
                message: 'Project deleted successfully.',
                success: true
            },
            PROJECT_EDITED:{
                title: 'Project updated',
                message: 'Project updated successfully.',
                success: true
            },
            PROJECT_INVITATION_APPROVAL_ACCEPT:{
                title: 'New user approved',
                message: 'New user approved successfully.',
                success: true

            },
            PROJECT_INVITATION_APPROVAL_REJECTED:{
                title: 'New user request rejected',
                message: 'New user request rejected.',
                success: true

            },
            PROJECT_INVITATION_CANCELLED:{
                title:'Invitation cancelled',
                message: 'Invitation cancelled.',
                success: true
            },
            PROJECT_INVITATION_RESENT:{
              title: 'Invitation resent',
                message: 'Invitation resent.',
                success: true
            },
            PROJECT_ADMIN_INVITATION_SENT:{
                title: 'Project admin request sent',
                message: 'Project admin request sent',
                success: true
            },
            PROJECT_ADMIN_INVITATION_SENT:{
                title: 'Project admin request sent',
                message: 'Project admin request sent',
                success: true
            },
            PROJECT_JOINED:{
                title: 'Project joined',
                message: 'You have successfully joined.',
                success: true
            },
            PROJECT_LEFT:{
                title: 'You have left project',
                message: 'You have successfully left.',
                success: true
            },
            PROJECT_SAVED:{
                title: 'Project saved',
                message: 'Project saved successfully.',
                success: true
            },
            PROJECT_UNARCHIVED:{
                title: 'Project unarchived',
                message: 'Project unarchived successfully.',
                success: true
            },
            PROJECT_USER_DELETED:{
                title: 'User removed',
                message: 'User removed successfully.',
                success: true
            },
            REMINDER_ADDED:{
                title: 'Reminder added',
                message: 'Reminder added successfully.',
                success: true
            },
            REMINDER_DELETED:{
                title: 'Reminder deleted',
                message: 'Reminder deleted successfully.',
                success: true
            },
            RESET_PASSWORD_CONFIRMATION:{
                title: 'Password reset successful',
                message: 'Congratulations! You have successfully updated your password. Please login below.',
                success: true
            },
            SETTINGS_SAVED:{
                title:  'Settings saved',
                message: 'Settings saved successfully.',
                success: true
            },
            TASK_ADD_TO_FAVOURITE:{
                title: 'Added to favourites',
                message: 'Added to favourites successfully.',
                success: true
            },
            TASK_COMPLETED:{
                title: 'Task completed',
                message: 'Task completed successfully.',
                success: true
            },
            TASK_UNCOMPLETED:{
                title:'Task re-opened',
                message:'Task re-opened successfully.',
                success:true
            },
            TASK_DUE_DATE_UPDATED:{
                title: 'Task due date updated',
                message: 'Task due date updated successfully.',
                success: true
            },
            TASK_EDITED:{
                title: 'Task updated',
                message: 'Task updated successfully.',
                success: true
            },
            TASK_REMOVE_FROM_FAVOURITE:{
                title: 'Removed from favourites',
                message: 'Removed from favourites.',
                success: true
            },
            TASK_SAVED:{
                title: 'Task saved',
                message: 'Task saved successfully.',
                success: true
            },
            TASK_DELETED:{
                title: 'Task deleted',
                message: 'Task deleted.',
                success: true
            },
            ACCOUNT_DELETED:{
                title: 'Account deleted.',
                message: 'Account deleted.',
                success: true
            }

        };

        self.infoMessages = {

            DISCARD_CHANGE:{
                title: 'Discard changes',
                message: "Are you sure you want to discard changes without saving?"
            },
            FILTER_DELETE_CONFIRMATION:{
                title: 'Delete filter',
                message: 'Are you sure you want to delete this filter?'
            },
            LABEL_DELETE_CONFIRMATION:{
                title: 'Delete label',
                message: 'Labels attached to existing tasks will be permanently detached. Are you sure you want to delete this label?'
            },
            LINK_TO_TASK_CONFIRMATION:{
                title: 'Link to task',
                message: 'NOTE:<br> Only users with access to the Project to which this task is assigned will be able to view the task via the above link.'
            },
            MULTIPLE_NOTES_DELETE_CONFIRMATION:{
                title: 'Delete',
                message: 'Are you sure you want to delete the selected notes and attachments?'
            },
            NO_DUE_DATE_SET:{
                title: 'No due date / time set',
                message: 'Due: -'
            },
            PROJECT_ARCHIVED_CONFIRMATION:{
                title: 'Archive project',
                message: "Are you sure you want to archive this project?"

            },
            PROJECT_DELETED_CONFIRMATION:{
                title: 'Delete project',
                message: "<strong>WARNING!</strong> You are about to permanently delete this project. ALL TASKS in this project will also be permanently deleted. Are you sure you want to continue?"

            },
            PROJECT_DELETED_DISALLOWED:{
                title: 'Delete project - Disallowed',
                message: "To delete this project, first remove all active project users then try again."

            },
            PROJECT_USER_DELETED:{
                title: 'Remove user',
                message: 'Are you sure you want to remove this user from this project?'
            },
            PROJECT_INVITATION_SENT_BY_ADMIN :{
                title: 'Invite user',
                message: 'Are you sure you want to send an invitation and grant this user access to this project?'
            },
            PROJECT_INVITATION_SENT_BY_USER :{
                title: 'Invite user',
                message: 'Your invitation request will be sent to the project admin for approval. Continue?'
            },
            PROJECT_INVITATION_RESENT:{
                title: 'Resend invitation',
                message:'Are you sure you want to resend this invitation?'
            },
            PROJECT_INVITATION_CANCELLED:{
                title: 'Cancel invitation',
                message: 'Are you sure you want to cancel this invitation?'
            },
            PROJECT_LEFT_CONFIRMATION:{
                title: 'Leave project',
                message: 'Are you sure you want to leave this project?'
            },
            PROJECT_ADMIN_REQUEST_CONFIRMATION:{
                title: 'Change project admin',
                message: "<strong>WARNING!</strong> You are about to invite another user to become the administrator of this project.<br/><br/>"+
                    'By doing this, you will loose all your existing admin permissions for this project and will be able to access the project only as a regular user.<br/><br/>'+
                    'This action cannot be reversed without the approval of the new project admin.<br/><br/>'+
                    'Are you sure you want to continue?'

            },
            PROJECT_UNARCHIVED_CONFIRMATION:{
                title: 'Unarchive project',
                message: 'Are you sure you want to unarchive this project?'

            },
            PROJECT_ADMIN_REQUEST_APPROVED:{
                title: 'Project admin request approved',
                message: 'Project admin request approved',
                success: true
            },
            PROJECT_ADMIN_REQUEST_REJECTED:{
                title: 'Project admin request rejected',
                message: 'Project admin request rejected',
                success: false
            },
            REMINDER_DELETE_CONFIRMATION:{
                title: 'Delete reminder',
                message: 'Are you sure you want to delete this reminder?'

            },
            SINGLE_NOTE_DELETE_CONFIRMATION:{
                title: 'Delete note',
                message: 'Are you sure you want to delete this note?'
            },
            SINGLE_FILE_DELETE_CONFIRMATION:{
                title: 'Delete attachment',
                message: 'Are you sure you want to delete this attachment?'
            },
            TASK_DELETE_CONFIRMATION:{
                title: 'Delete task',
                message: "Are you sure you want to delete this task? Note that all task details, notes, attachments and history will be permanently deleted for all users."

            },
            TASK_HISTORY:{
                title:'Task history',
                message:"<p>The 'Task History' feature is a change log of each task and shows updates by user, date/time and change type. This feature is not available on your current license type.</p><p><a href='"+CONSTANT.upgradeUrl+"' target='_blank'> Click here</a> to upgrade your license.</p>",
                success:false
            },
            API_VERSION_CHANGE:{
                title:'TodoZu: Logout required',
                message:"Important updates have been applied to the TodoZu service. You are required to logout and login again for these changes to take effect.",
                success:false
            }

        };

        var alertValue={};

        self.setAlert = function(msg){
            alertValue = {
                title: msg.title,
                msg: msg.message,
                success: msg.success
            }
        };

        self.getAlert = function(){
            return alertValue;
        };

        self.clearAlert = function(){
            alertValue= {};
        };

    }]);
}).call(this);
